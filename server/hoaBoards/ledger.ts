/**
 * Keycove HOA ledger: charges, payments, late fees, autopay and reminders.
 * Shared by the router, the daily scheduler and the Stripe webhook.
 */
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "../db";
import { sendEmail } from "../_core/email";
import {
  hoaAssociations, hoaCharges, hoaHomes, hoaPayments,
  type HoaAssociation, type HoaCharge, type HoaHome, type HoaPayment,
} from "../../drizzle/schema";
import {
  addDays, applicationFeeCents, cardFeeCents, daysBetween, dueDatesBetween, fmtUsd, FREQUENCY_LABEL,
  homeLabel, lateFeeCents, lateMonths, stateRules, type AchFeeBearer,
} from "../../shared/hoaBoards";
import { APP_URL, getAchFeeBearer, getStripe, HOA_META } from "./stripe";

export async function hoaDb() {
  const d = await getDb();
  if (!d) throw new Error("Database unavailable");
  return d;
}

export const todayYmd = () => new Date().toISOString().slice(0, 10);
export const esc = (v: unknown) => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const affected = (res: any): number => Number((Array.isArray(res) ? res[0] : res)?.affectedRows ?? 0);

// ─── Plan state ─────────────────────────────────────────────────────────────
/** Trial lapsed without a subscription → expired (persisted). Returns the fresh row. */
export async function refreshPlanState(a: HoaAssociation): Promise<HoaAssociation> {
  if (a.planStatus === "trialing" && !a.stripeSubscriptionId && a.trialEndsAt && a.trialEndsAt.getTime() < Date.now()) {
    const d = await hoaDb();
    await d.update(hoaAssociations).set({ planStatus: "expired" }).where(eq(hoaAssociations.id, a.id));
    return { ...a, planStatus: "expired" };
  }
  return a;
}

/** Can this association create new charges (assessments, late fees, autopay)? */
export function planAllowsBilling(a: HoaAssociation): boolean {
  if (a.planStatus === "active" || a.planStatus === "past_due") return true;
  if (a.planStatus === "trialing") return !!a.stripeSubscriptionId || (!!a.trialEndsAt && a.trialEndsAt.getTime() > Date.now());
  return false;
}

export const homeAssessmentCents = (a: HoaAssociation, h: HoaHome) => h.assessmentCents ?? a.assessmentCents;
export const remaining = (c: HoaCharge) => Math.max(0, c.amountCents - c.paidCents);

// ─── Reads ──────────────────────────────────────────────────────────────────
export async function openCharges(homeIds: number[]): Promise<HoaCharge[]> {
  if (!homeIds.length) return [];
  const d = await hoaDb();
  const rows = await d.select().from(hoaCharges).where(and(inArray(hoaCharges.homeId, homeIds), eq(hoaCharges.status, "open")));
  return rows.filter(c => remaining(c) > 0).sort((x, y) => x.dueDate.localeCompare(y.dueDate) || x.id - y.id);
}

export function parseAllocations(p: Pick<HoaPayment, "allocations">): { chargeId: number; cents: number }[] {
  try { const v = JSON.parse(p.allocations); return Array.isArray(v) ? v : []; } catch { return []; }
}

/** Charge ids covered by a payment that hasn't settled yet (ACH takes ~4 business days). */
export async function inflightChargeIds(homeIds: number[]): Promise<Set<number>> {
  const out = new Set<number>();
  if (!homeIds.length) return out;
  const d = await hoaDb();
  const pays = await d.select().from(hoaPayments).where(and(inArray(hoaPayments.homeId, homeIds), inArray(hoaPayments.status, ["pending", "processing"])));
  // An abandoned Checkout (expires after 1 hour → checkout.session.expired marks it
  // canceled) shouldn't block paying forever if that webhook never arrives.
  const cutoff = Date.now() - 25 * 3600_000;
  for (const p of pays) {
    if (p.status === "pending" && p.createdAt.getTime() < cutoff) continue;
    for (const a of parseAllocations(p)) out.add(a.chargeId);
  }
  return out;
}

// ─── Charge generation ──────────────────────────────────────────────────────
/** Create recurring assessment charges due within the bill-ahead window. Idempotent. */
export async function generateRecurringCharges(a: HoaAssociation, today = todayYmd()): Promise<number> {
  if (!a.billingEnabled || !a.firstDueDate || !a.billingStartedOn || !planAllowsBilling(a)) return 0;
  const d = await hoaDb();
  const homes = await d.select().from(hoaHomes).where(and(eq(hoaHomes.associationId, a.id), eq(hoaHomes.active, 1)));
  const to = addDays(today, a.billAheadDays);
  const label = FREQUENCY_LABEL[a.assessmentFrequency];
  const rows: (typeof hoaCharges.$inferInsert)[] = [];
  for (const h of homes) {
    const amount = homeAssessmentCents(a, h);
    if (!amount || amount <= 0) continue;
    const from = h.billingStartsOn && h.billingStartsOn > a.billingStartedOn ? h.billingStartsOn : a.billingStartedOn;
    for (const due of dueDatesBetween(a.firstDueDate, a.assessmentFrequency, from, to)) {
      rows.push({
        associationId: a.id, homeId: h.id, kind: "assessment",
        description: `${label} assessment — due ${due}`,
        periodKey: `a-${due}`, amountCents: amount, dueDate: due,
      });
    }
  }
  let created = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const res = await d.insert(hoaCharges).ignore().values(rows.slice(i, i + 500));
    created += affected(res);
  }
  return created;
}

/** One charge per active home for a special assessment. Idempotent. */
export async function createSpecialAssessmentCharges(a: HoaAssociation, sa: { id: number; title: string; amountCents: number; dueDate: string }): Promise<number> {
  const d = await hoaDb();
  const homes = await d.select({ id: hoaHomes.id }).from(hoaHomes).where(and(eq(hoaHomes.associationId, a.id), eq(hoaHomes.active, 1)));
  if (!homes.length) return 0;
  const res = await d.insert(hoaCharges).ignore().values(homes.map(h => ({
    associationId: a.id, homeId: h.id, kind: "special" as const,
    description: `Special assessment: ${sa.title}`.slice(0, 300),
    periodKey: `special-${sa.id}`, amountCents: sa.amountCents, dueDate: sa.dueDate, specialAssessmentId: sa.id,
  })));
  return affected(res);
}

/**
 * Monthly late charges on unpaid assessment installments past the grace
 * period, capped by the state's rule (NC: greater of $20/month or 10% of the
 * unpaid installment, 47F-3-102(11)). One per installment per late month.
 */
export async function assessLateFees(a: HoaAssociation, today = todayYmd()): Promise<number> {
  if (!a.lateFeeEnabled || !planAllowsBilling(a)) return 0;
  const d = await hoaDb();
  const homes = await d.select().from(hoaHomes).where(eq(hoaHomes.associationId, a.id));
  const homeById = new Map(homes.map(h => [h.id, h]));
  const open = (await openCharges(homes.map(h => h.id))).filter(c => c.kind === "assessment" || c.kind === "special");
  const inflight = await inflightChargeIds(homes.map(h => h.id));
  let created = 0;
  for (const c of open) {
    if (inflight.has(c.id)) continue;
    const months = lateMonths(c.dueDate, a.graceDays, today);
    if (months <= 0) continue;
    const fee = lateFeeCents({ state: a.state, mode: a.lateFeeMode, flatCents: a.lateFeeFlatCents, percent: a.lateFeePercent, unpaidInstallmentCents: remaining(c) });
    if (fee <= 0) continue;
    const res = await d.insert(hoaCharges).ignore().values({
      associationId: a.id, homeId: c.homeId, kind: "late_fee",
      description: `Late charge (month ${months}) on ${c.description}`.slice(0, 300),
      periodKey: `late-${c.id}-${months}`, amountCents: fee, dueDate: today, parentChargeId: c.id, reminderStage: 3,
    });
    if (affected(res) > 0) {
      created++;
      const h = homeById.get(c.homeId);
      if (h?.email) {
        await sendEmail({
          to: h.email, replyTo: a.contactEmail ?? undefined,
          subject: `Late charge added — ${a.name}`,
          html: emailShell(a, `Late charge added`, `
            <p>Hi ${esc(h.ownerName)},</p>
            <p>${esc(c.description)} (due ${esc(c.dueDate)}) is still unpaid, so a late charge of <strong>${fmtUsd(fee)}</strong> was added to your account for ${esc(homeLabel(h))}.</p>
            ${portalButton(h.email, "Pay now — bank payments are free")}`),
        }).catch(() => {});
      }
    }
  }
  return created;
}

// ─── Payments ───────────────────────────────────────────────────────────────
export type PayMethod = "ach" | "card";

/**
 * Create a pending payment covering the given (or all) open, not-in-flight
 * charges of a home. Returns the row plus the Stripe amounts to charge.
 */
export async function createPendingPayment(opts: {
  a: HoaAssociation; h: HoaHome; method: PayMethod; source: "portal" | "autopay"; chargeIds?: number[]; maxDueDate?: string;
}): Promise<{ payment: HoaPayment; charges: HoaCharge[]; achBearer: AchFeeBearer } | null> {
  const d = await hoaDb();
  const inflight = await inflightChargeIds([opts.h.id]);
  let charges = (await openCharges([opts.h.id])).filter(c => !inflight.has(c.id));
  if (opts.chargeIds?.length) charges = charges.filter(c => opts.chargeIds!.includes(c.id));
  if (opts.maxDueDate) charges = charges.filter(c => c.dueDate <= opts.maxDueDate!);
  if (!charges.length) return null;
  const amount = charges.reduce((s, c) => s + remaining(c), 0);
  const fee = opts.method === "card" ? cardFeeCents(amount) : 0;
  const achBearer = await getAchFeeBearer();
  const appFee = applicationFeeCents({ method: opts.method, amountCents: amount, feeCents: fee, achBearer });
  const res = await d.insert(hoaPayments).values({
    associationId: opts.a.id, homeId: opts.h.id, amountCents: amount, feeCents: fee, totalCents: amount + fee,
    method: opts.method, source: opts.source, status: "pending", applicationFeeCents: appFee,
    achFeeBearer: opts.method === "ach" ? achBearer : null,
    allocations: JSON.stringify(charges.map(c => ({ chargeId: c.id, cents: remaining(c) }))),
  });
  const id = Number((res as any)[0]?.insertId ?? (res as any).insertId);
  const [payment] = await d.select().from(hoaPayments).where(eq(hoaPayments.id, id));
  return { payment, charges, achBearer };
}

async function applyAllocations(p: HoaPayment) {
  const d = await hoaDb();
  for (const al of parseAllocations(p)) {
    await d.update(hoaCharges).set({
      paidCents: sql`LEAST(${hoaCharges.amountCents}, ${hoaCharges.paidCents} + ${al.cents})`,
    }).where(eq(hoaCharges.id, al.chargeId));
    await d.update(hoaCharges).set({ status: "paid", paidAt: new Date() })
      .where(and(eq(hoaCharges.id, al.chargeId), eq(hoaCharges.status, "open"), sql`${hoaCharges.paidCents} >= ${hoaCharges.amountCents}`));
  }
}

/** Idempotent: only the first call for a payment applies it and sends the receipt. */
export async function markPaymentSucceeded(paymentId: number, patch: { stripePaymentIntentId?: string | null } = {}) {
  const d = await hoaDb();
  const res = await d.update(hoaPayments).set({
    status: "succeeded", paidAt: new Date(), failureReason: null,
    ...(patch.stripePaymentIntentId ? { stripePaymentIntentId: patch.stripePaymentIntentId } : {}),
  }).where(and(eq(hoaPayments.id, paymentId), inArray(hoaPayments.status, ["pending", "processing", "failed"])));
  if (affected(res) === 0) return false;
  const [p] = await d.select().from(hoaPayments).where(eq(hoaPayments.id, paymentId));
  await applyAllocations(p);
  await sendReceiptEmail(p).catch(e => console.warn("[hoaBoards] receipt email failed", e));
  return true;
}

export async function markPaymentProcessing(paymentId: number, stripePaymentIntentId?: string | null) {
  const d = await hoaDb();
  await d.update(hoaPayments).set({ status: "processing", ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}) })
    .where(and(eq(hoaPayments.id, paymentId), eq(hoaPayments.status, "pending")));
}

/** Abandoned checkout / canceled intent: no email, charges stay open. */
export async function markPaymentCanceled(paymentId: number) {
  const d = await hoaDb();
  await d.update(hoaPayments).set({ status: "canceled" }).where(and(eq(hoaPayments.id, paymentId), eq(hoaPayments.status, "pending")));
}

export async function markPaymentFailed(paymentId: number, reason: string, stripePaymentIntentId?: string | null) {
  const d = await hoaDb();
  const res = await d.update(hoaPayments).set({ status: "failed", failureReason: reason.slice(0, 300), ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}) })
    .where(and(eq(hoaPayments.id, paymentId), inArray(hoaPayments.status, ["pending", "processing"])));
  if (affected(res) === 0) return;
  const [p] = await d.select().from(hoaPayments).where(eq(hoaPayments.id, paymentId));
  const [h] = await d.select().from(hoaHomes).where(eq(hoaHomes.id, p.homeId));
  const [a] = await d.select().from(hoaAssociations).where(eq(hoaAssociations.id, p.associationId));
  if (h?.email && a) {
    await sendEmail({
      to: h.email, replyTo: a.contactEmail ?? undefined,
      subject: `Your ${a.name} payment didn't go through`,
      html: emailShell(a, "Payment didn't go through", `
        <p>Hi ${esc(h.ownerName)},</p>
        <p>Your ${p.method === "ach" ? "bank" : "card"} payment of <strong>${fmtUsd(p.totalCents)}</strong> for ${esc(homeLabel(h))} failed${reason ? ` (${esc(reason)})` : ""}. Your balance is still open.</p>
        ${portalButton(h.email, "Try again")}`),
    }).catch(() => {});
  }
}

export function receiptNumber(p: Pick<HoaPayment, "associationId" | "id">) {
  return `HOA-${p.associationId}-${String(p.id).padStart(6, "0")}`;
}

async function sendReceiptEmail(p: HoaPayment) {
  const d = await hoaDb();
  const [h] = await d.select().from(hoaHomes).where(eq(hoaHomes.id, p.homeId));
  const [a] = await d.select().from(hoaAssociations).where(eq(hoaAssociations.id, p.associationId));
  if (!h?.email || !a) return;
  const ids = parseAllocations(p).map(x => x.chargeId);
  const charges = ids.length ? await d.select().from(hoaCharges).where(inArray(hoaCharges.id, ids)) : [];
  const methodLabel = { ach: "Bank (ACH)", card: "Card", check: "Check", cash: "Cash", other: "Other" }[p.method];
  await sendEmail({
    to: h.email, replyTo: a.contactEmail ?? undefined,
    subject: `Receipt ${receiptNumber(p)} — ${a.name}`,
    html: emailShell(a, "Payment received — thank you", `
      <p>Hi ${esc(h.ownerName)},</p>
      <p>${esc(a.name)} received your payment for ${esc(homeLabel(h))}.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0">
        ${charges.map(c => `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${esc(c.description)}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">${fmtUsd(parseAllocations(p).find(x => x.chargeId === c.id)?.cents ?? 0)}</td></tr>`).join("")}
        ${p.feeCents ? `<tr><td style="padding:6px 0;color:#6b7280">Card processing fee (at cost)</td><td style="padding:6px 0;text-align:right;color:#6b7280">${fmtUsd(p.feeCents)}</td></tr>` : ""}
        <tr><td style="padding:8px 0;font-weight:800">Total</td><td style="padding:8px 0;text-align:right;font-weight:800">${fmtUsd(p.totalCents)}</td></tr>
      </table>
      <p style="color:#6b7280;font-size:13px">Receipt ${receiptNumber(p)} · ${methodLabel} · ${new Date().toISOString().slice(0, 10)}</p>
      ${portalButton(h.email, "View history and receipts")}`),
  });
}

// ─── Autopay ────────────────────────────────────────────────────────────────
/** Charge saved payment methods for charges due today or earlier. */
export async function chargeAutopay(a: HoaAssociation, today = todayYmd()): Promise<{ attempted: number; succeeded: number; failed: number }> {
  const out = { attempted: 0, succeeded: 0, failed: 0 };
  if (!planAllowsBilling(a) || a.connectStatus !== "active" || !a.stripeConnectAccountId) return out;
  const stripe = getStripe();
  if (!stripe) return out;
  const d = await hoaDb();
  const homes = await d.select().from(hoaHomes).where(and(eq(hoaHomes.associationId, a.id), eq(hoaHomes.autopayEnabled, 1)));
  const recentFailCutoff = new Date(Date.now() - 3 * 86_400_000);
  for (const h of homes) {
    if (!h.stripeCustomerId || !h.stripePaymentMethodId || !h.autopayMethod) continue;
    if (h.autopayMethod === "card" && !a.acceptCards) continue;
    const [recentFail] = await d.select({ id: hoaPayments.id }).from(hoaPayments)
      .where(and(eq(hoaPayments.homeId, h.id), eq(hoaPayments.source, "autopay"), eq(hoaPayments.status, "failed"), gte(hoaPayments.createdAt, recentFailCutoff))).limit(1);
    if (recentFail) continue; // give the owner 3 days to fix it before retrying
    const pending = await createPendingPayment({ a, h, method: h.autopayMethod, source: "autopay", maxDueDate: today });
    if (!pending) continue;
    const p = pending.payment;
    out.attempted++;
    try {
      const pi = await stripe.paymentIntents.create({
        amount: p.totalCents, currency: "usd",
        customer: h.stripeCustomerId, payment_method: h.stripePaymentMethodId,
        payment_method_types: [h.autopayMethod === "ach" ? "us_bank_account" : "card"],
        off_session: true, confirm: true,
        ...(p.applicationFeeCents > 0 ? { application_fee_amount: p.applicationFeeCents } : {}),
        transfer_data: { destination: a.stripeConnectAccountId },
        description: `${a.name} — ${homeLabel(h)}`.slice(0, 200),
        metadata: { [HOA_META]: "1", hoaPaymentId: String(p.id), hoaAssociationId: String(a.id), hoaHomeId: String(h.id) },
      }, { idempotencyKey: `hoa-autopay-${p.id}` });
      if (pi.status === "succeeded") { await markPaymentSucceeded(p.id, { stripePaymentIntentId: pi.id }); out.succeeded++; }
      else if (pi.status === "processing") { await markPaymentProcessing(p.id, pi.id); out.succeeded++; }
      else { await markPaymentFailed(p.id, `Payment needs attention (${pi.status})`, pi.id); out.failed++; }
    } catch (e: any) {
      const piId = e?.raw?.payment_intent?.id ?? null;
      await markPaymentFailed(p.id, e?.raw?.message ?? e?.message ?? "Payment failed", piId);
      out.failed++;
    }
  }
  return out;
}

// ─── Reminders ──────────────────────────────────────────────────────────────
/** 1 = upcoming, 2 = due (within grace), 3 = overdue. */
export function reminderStageFor(dueDate: string, today: string, reminderDaysBefore: number, graceDays: number): number {
  const d = daysBetween(today, dueDate);
  if (d > reminderDaysBefore) return 0;
  if (d > 0) return 1;
  if (-d <= graceDays) return 2;
  return 3;
}

export async function sendReminders(a: HoaAssociation, today = todayYmd()): Promise<number> {
  const d = await hoaDb();
  const homes = await d.select().from(hoaHomes).where(and(eq(hoaHomes.associationId, a.id), eq(hoaHomes.active, 1)));
  const homeById = new Map(homes.map(h => [h.id, h]));
  const open = await openCharges(homes.map(h => h.id));
  const inflight = await inflightChargeIds(homes.map(h => h.id));
  const byHome = new Map<number, { c: HoaCharge; stage: number }[]>();
  for (const c of open) {
    if (inflight.has(c.id)) continue;
    const stage = reminderStageFor(c.dueDate, today, a.reminderDaysBefore, a.graceDays);
    if (stage > c.reminderStage) byHome.set(c.homeId, [...(byHome.get(c.homeId) ?? []), { c, stage }]);
  }
  let sent = 0;
  for (const [homeId, items] of Array.from(byHome.entries())) {
    const h = homeById.get(homeId);
    if (!h) continue;
    const top = Math.max(...items.map(i => i.stage));
    const balance = open.filter(c => c.homeId === homeId).reduce((s, c) => s + remaining(c), 0);
    if (h.email) {
      const subject = top === 3 ? `Past due: ${a.name} balance ${fmtUsd(balance)}`
        : top === 2 ? `Due today: ${a.name} dues` : `Upcoming: ${a.name} dues due ${items[0].c.dueDate}`;
      const autopayLine = h.autopayEnabled && top < 3
        ? `<p>You're on <strong>autopay</strong> (${esc(h.paymentMethodLabel ?? h.autopayMethod)}), so it will be charged on the due date. Nothing to do.</p>` : "";
      try {
        await sendEmail({
          to: h.email, replyTo: a.contactEmail ?? undefined, subject,
          html: emailShell(a, top === 3 ? "Your account is past due" : "Dues reminder", `
            <p>Hi ${esc(h.ownerName)},</p>
            <p>${top === 3 ? "These charges are past due" : "Here's what's coming up"} for ${esc(homeLabel(h))}:</p>
            <ul>${items.map(i => `<li>${esc(i.c.description)}: <strong>${fmtUsd(remaining(i.c))}</strong> (due ${esc(i.c.dueDate)})</li>`).join("")}</ul>
            <p>Total balance: <strong>${fmtUsd(balance)}</strong></p>
            ${autopayLine}
            ${portalButton(h.email, "Pay now — bank payments are free")}`),
        });
        sent++;
      } catch (e) {
        console.warn("[hoaBoards] reminder failed", h.id, e);
        continue;
      }
    }
    for (const i of items) await d.update(hoaCharges).set({ reminderStage: i.stage }).where(eq(hoaCharges.id, i.c.id));
  }
  return sent;
}

// ─── Email chrome ───────────────────────────────────────────────────────────
export function portalButton(email: string | null | undefined, label: string) {
  const url = `${APP_URL()}/hoa-portal${email ? `?email=${encodeURIComponent(email)}` : ""}`;
  return `<p style="margin-top:20px"><a href="${url}" style="background:#1B2B5E;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700;display:inline-block">${esc(label)}</a></p>`;
}

export function emailShell(a: Pick<HoaAssociation, "name">, title: string, body: string) {
  return `<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
    <p style="margin:0 0 4px;color:#6b7280;font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase">${esc(a.name)}</p>
    <h2 style="color:#1B2B5E;margin:0 0 16px">${esc(title)}</h2>
    ${body}
    <p style="color:#9ca3af;font-size:12px;margin-top:28px;border-top:1px solid #e5e7eb;padding-top:12px">Sent by Keycove on behalf of ${esc(a.name)}. Reply to this email to reach your HOA board.</p>
  </div>`;
}

/** Latest payments for a set of homes (portal + board views). */
export async function recentPayments(where: { associationId?: number; homeIds?: number[] }, limit = 200) {
  const d = await hoaDb();
  const cond = where.homeIds ? inArray(hoaPayments.homeId, where.homeIds.length ? where.homeIds : [-1]) : eq(hoaPayments.associationId, where.associationId!);
  return d.select().from(hoaPayments).where(cond).orderBy(desc(hoaPayments.createdAt)).limit(limit);
}

export { stateRules };
