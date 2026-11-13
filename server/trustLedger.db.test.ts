/**
 * End-to-end trust accounting against a real MySQL database: payment routing,
 * webhook posting, ledgers, fees, approvals, overdraw blocks under
 * concurrency, reconciliation, deposits, statements and permissions.
 *
 * Runs only when TRUST_TEST_DATABASE_URL points at a scratch database that
 * already has the schema (`DATABASE_URL=… npx drizzle-kit push --force`).
 * Never point it at production.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";

const DB_URL = process.env.TRUST_TEST_DATABASE_URL;
const stripeCalls = vi.hoisted(() => ({ sessions: [] as any[], subUpdates: [] as any[], reversals: new Map<string, any>(), fee: 0 }));

vi.mock("stripe", () => {
  class FakeStripe {
    checkout = { sessions: { create: async (args: any) => { stripeCalls.sessions.push(args); return { id: `cs_test_${stripeCalls.sessions.length}`, url: "https://checkout.stripe.test/x" }; } } };
    paymentIntents = { retrieve: async (id: string) => ({ transfer_data: { destination: "acct_pm_test" }, latest_charge: { id: `ch_${id}`, transfer: `tr_${id}`, balance_transaction: { fee: stripeCalls.fee } } }) };
    // Like Stripe, a repeated idempotency key returns the first result instead of reversing again.
    transfers = { createReversal: async (transferId: string, args: any, opts: any) => { if (!stripeCalls.reversals.has(opts.idempotencyKey)) stripeCalls.reversals.set(opts.idempotencyKey, { transferId, ...args }); return stripeCalls.reversals.get(opts.idempotencyKey); } };
    invoices = { retrieve: async () => ({}) };
    subscriptions = { retrieve: async (id: string) => ({ id, status: "active", transfer_data: { destination: "acct_landlord_test" }, metadata: {} }), update: async (id: string, args: any) => { stripeCalls.subUpdates.push({ id, args }); return {}; } };
    payouts = { list: async () => ({ data: [] }) };
    balanceTransactions = { list: async () => ({ data: [] }) };
    accounts = { retrieve: async () => ({}) };
  }
  return { default: FakeStripe };
});

const run = DB_URL ? describe : describe.skip;
vi.setConfig({ testTimeout: 30_000 });

run("trust accounting (MySQL)", () => {
  let appRouter: typeof import("./routers").appRouter;
  let schema: typeof import("../drizzle/schema");
  let dbm: typeof import("./db");
  let d: any;
  let eq: any;
  const tag = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const ids: Record<string, number> = {};
  const userObj: Record<string, any> = {};
  const caller = (key: string) => appRouter.createCaller({ user: userObj[key], req: { protocol: "https", headers: {} } as any, res: { clearCookie: () => {} } as any });

  async function mkUser(key: string, opts: { pro?: boolean; acct?: string } = {}) {
    const email = `${key}-${tag}@trust.test`;
    const res = await d.insert(schema.users).values({ openId: `t-${key}-${tag}`, email, name: `${key} ${tag}`, emailVerified: 1 });
    const id = Number(res[0].insertId);
    if (opts.pro || opts.acct) await d.insert(schema.userSubscriptions).values({ userId: id, tier: opts.pro ? "paid" : "free", status: "active", stripeConnectAccountId: opts.acct ?? null, stripeConnectStatus: opts.acct ? "active" : "not_connected" });
    const [u] = await d.select().from(schema.users).where(eq(schema.users.id, id));
    userObj[key] = u;
    ids[key] = id;
    return id;
  }

  const ledgerSum = async (accountId: number) => {
    const rows = await d.select().from(schema.trustLedgerEntries).where(eq(schema.trustLedgerEntries.trustAccountId, accountId));
    return rows.reduce((s: number, r: any) => s + r.amountCents, 0);
  };
  const journalSum = async (accountId: number) => {
    const rows = await d.select().from(schema.trustJournalEntries).where(eq(schema.trustJournalEntries.trustAccountId, accountId));
    return rows.reduce((s: number, r: any) => s + r.amountCents, 0);
  };

  beforeAll(async () => {
    process.env.DATABASE_URL = DB_URL;
    process.env.STRIPE_SECRET_KEY = "sk_test_fake";
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret-for-trust";
    delete process.env.BREVO_API_KEY;
    delete process.env.TRUST_ACCOUNTING_PLAN;
    ({ appRouter } = await import("./routers"));
    schema = await import("../drizzle/schema");
    dbm = await import("./db");
    ({ eq } = await import("drizzle-orm"));
    d = await dbm.getDb();

    await mkUser("pm", { pro: true, acct: "acct_pm_test" });
    await mkUser("landlord", { pro: true, acct: "acct_landlord_test" });
    await mkUser("ownerUser");
    await mkUser("staff");
    await mkUser("freeUser", { acct: undefined });
  }, 120_000);

  it("plan gate: free accounts can't open trust books", async () => {
    const a = await caller("freeUser").trust.access();
    expect(a.enabled).toBe(false);
    await expect(caller("freeUser").trust.overview()).rejects.toThrow(/Pro/);
    const pmAccess = await caller("pm").trust.access();
    expect(pmAccess.plan).toBe("pro");
    expect(pmAccess.ownAllowed).toBe(true);
  });

  it("sets up a trust account, owner, property and agreement", async () => {
    const pm = caller("pm");
    await expect(pm.trust.accounts.upsert({ name: "Acme Realty Operating", bankName: "First Bank" } as any)).rejects.toThrow(/Trust Account/);
    ids.account = (await pm.trust.accounts.upsert({ name: "Acme Realty Trust Account", bankName: "First Bank", bankAddress: "300 SW Broad St\nSouthern Pines, NC 28387", accountLast4: "4321", receivesStripePayouts: true } as any)).id;
    ids.owner = (await pm.trust.owners.upsert({ name: "Olivia Owner", email: `olivia-${tag}@trust.test`, w9OnFile: true, taxIdLast4: "6789", taxIdType: "ssn", mailingAddress: "1 Owner Way, Raleigh, NC 27601" } as any)).id;
    ids.property = (await pm.trust.addProperty({ address: `${tag} Elm St`, city: "Fayetteville", state: "NC", zip: "28301" } as any)).id;
    const res = await pm.trust.agreements.upsert({
      trustOwnerId: ids.owner, crmPropertyId: ids.property, trustAccountId: ids.account, startDate: "2026-11-01",
      mgmtFeeType: "percent", mgmtFeeBps: 1000, leasingFeeType: "percent_of_first_month", leasingFeeValue: 5000,
      reserveCents: 20_000, ownerApprovalMode: "expenses_over_threshold", expenseApprovalThresholdCents: 50_000,
    } as any);
    ids.agreement = res.id;
    await expect(pm.trust.agreements.upsert({ trustOwnerId: ids.owner, crmPropertyId: ids.property, trustAccountId: ids.account, startDate: "2026-11-01", mgmtFeeType: "none" } as any)).rejects.toThrow(/already has an active/);
    // tenants on the managed property and on a self-managed landlord property
    const t1 = await d.insert(schema.crmTenants).values({ userId: ids.pm, crmPropertyId: ids.property, firstName: "Tina", lastName: "Tenant", email: `tina-${tag}@trust.test`, monthlyRent: 150_000, securityDeposit: 150_000 });
    ids.tenant = Number(t1[0].insertId);
    const lp = await d.insert(schema.crmProperties).values({ userId: ids.landlord, address: `${tag} Self-Managed Rd`, city: "Durham", state: "NC" });
    ids.landlordProperty = Number(lp[0].insertId);
    const t2 = await d.insert(schema.crmTenants).values({ userId: ids.landlord, crmPropertyId: ids.landlordProperty, firstName: "Sam", lastName: "Self", email: `sam-${tag}@trust.test`, monthlyRent: 120_000 });
    ids.landlordTenant = Number(t2[0].insertId);
  });

  it("routes managed-property rent to the PM's Connect account, self-managed rent to the landlord", async () => {
    const { resolveRentPayee } = await import("./trust/routing");
    const managed = await resolveRentPayee({ landlordUserId: ids.pm, crmPropertyId: ids.property });
    expect(managed.connectAccountId).toBe("acct_pm_test");
    expect(managed.agreement?.id).toBe(ids.agreement);
    const self = await resolveRentPayee({ landlordUserId: ids.landlord, crmPropertyId: ids.landlordProperty });
    expect(self.connectAccountId).toBe("acct_landlord_test");
    expect(self.agreement).toBeNull();

    // Through the real tenant pay-link procedure
    const link = await caller("pm").crm.getRentLink({ crmTenantId: ids.tenant });
    await appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} } as any, res: {} as any }).marketplace.createCrmRentPaymentSession({ token: link.token, amountDollars: 1500 });
    const s1 = stripeCalls.sessions.at(-1);
    expect(s1.payment_intent_data.transfer_data.destination).toBe("acct_pm_test");
    expect(s1.payment_intent_data.application_fee_amount).toBeUndefined(); // Pro: 0%
    expect(s1.metadata.trustAgreementId).toBe(String(ids.agreement));
    ids.paymentRecord = Number(s1.metadata.leaselyPaymentId);

    const link2 = await caller("landlord").crm.getRentLink({ crmTenantId: ids.landlordTenant });
    await appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} } as any, res: {} as any }).marketplace.createCrmRentPaymentSession({ token: link2.token, amountDollars: 1200 });
    const s2 = stripeCalls.sessions.at(-1);
    expect(s2.payment_intent_data.transfer_data.destination).toBe("acct_landlord_test");
    expect(s2.metadata.trustAgreementId).toBeUndefined();
    ids.landlordPayment = Number(s2.metadata.leaselyPaymentId);
  });

  it("webhook posts a paid Stripe rent checkout to trust once, and accrues the fee", async () => {
    const { handleRentCheckoutSession } = await import("./trust/stripeHooks");
    const Stripe = (await import("stripe")).default as any;
    const stripe = new Stripe("sk");
    const session: any = { id: "cs_x", payment_intent: `pi_${tag}`, payment_status: "unpaid", created: Math.floor(Date.parse("2026-11-03T15:00:00Z") / 1000), metadata: { leaselyPaymentId: String(ids.paymentRecord), trustAgreementId: String(ids.agreement) } };
    await handleRentCheckoutSession(stripe, session, "checkout.session.completed"); // ACH still processing
    expect(await journalSum(ids.account)).toBe(0);
    session.payment_status = "paid";
    await handleRentCheckoutSession(stripe, session, "checkout.session.async_payment_succeeded");
    await handleRentCheckoutSession(stripe, session, "checkout.session.async_payment_succeeded"); // retry
    const journal = await d.select().from(schema.trustJournalEntries).where(eq(schema.trustJournalEntries.trustAccountId, ids.account));
    expect(journal).toHaveLength(1);
    expect(journal[0]).toMatchObject({ amountCents: 150_000, method: "stripe", receivedDate: "2026-11-03" });
    const [rec] = await d.select().from(schema.paymentRecords).where(eq(schema.paymentRecords.id, ids.paymentRecord));
    expect(rec.status).toBe("paid");
    const fees = await caller("pm").trust.fees.list();
    expect(fees.map((f: any) => f.amountCents)).toEqual([15_000]);
  });

  it("does not post to trust when the money didn't go to the PM", async () => {
    const { handleRentCheckoutSession } = await import("./trust/stripeHooks");
    const pid = await dbm.createPaymentRecord({ crmPropertyId: ids.property, crmTenantId: ids.tenant, landlordUserId: ids.pm, tenantName: "Tina Tenant", tenantEmail: "t@x", amountCents: 1000, description: "Rent", status: "pending" } as any);
    const wrongStripe: any = { paymentIntents: { retrieve: async () => ({ transfer_data: { destination: "acct_someone_else" } }) } };
    await handleRentCheckoutSession(wrongStripe, { id: "cs_y", payment_intent: `pi_wrong_${tag}`, payment_status: "paid", created: 1793750400, metadata: { leaselyPaymentId: String(pid), trustAgreementId: String(ids.agreement) } } as any, "checkout.session.completed");
    expect(await journalSum(ids.account)).toBe(150_000);
  });

  it("manual receipt: security deposit to its own ledger, late deposit flagged", async () => {
    const r = await caller("pm").trust.receipts.record({ agreementId: ids.agreement, depositCents: 150_000, receivedDate: "2026-11-04", depositedDate: "2026-11-10", method: "check", reference: "DT-101", remitter: "Tina Tenant", crmTenantId: ids.tenant, periodMonth: "2026-11", leaseStartDate: "2026-11-01" } as any);
    expect(r.deadline).toBe("2026-11-09"); // Wed → Thu, Fri, Mon (Veterans Day is Wed 11/11)
    expect(r.late).toBe(true);
    const deps = await caller("pm").trust.deposits.list();
    expect(deps[0]).toMatchObject({ heldCents: 150_000, tenantName: "Tina Tenant" });
    expect(deps[0].deadlines.bankNoticeDue).toBe("2026-12-01");
    const ov = await caller("pm").trust.overview();
    expect(ov.compliance.some((c: any) => c.code === "late_deposit")).toBe(true);
  });

  it("blocks owner payouts above balance − fees − reserve, even under concurrency", async () => {
    const pm = caller("pm");
    const prev = await pm.trust.disbursements.preview();
    const item = prev[0].items[0];
    expect(item).toMatchObject({ balanceCents: 150_000, feesAccruedCents: 15_000, reserveCents: 20_000, availableCents: 115_000, depositsHeldCents: 150_000 });
    await expect(pm.trust.disbursements.payOwner({ items: [{ agreementId: ids.agreement, amountCents: 115_001 }], entryDate: "2026-11-12", method: "ach" })).rejects.toThrow(/available/);
    const results = await Promise.allSettled([
      pm.trust.disbursements.payOwner({ items: [{ agreementId: ids.agreement, amountCents: 115_000 }], entryDate: "2026-11-12", method: "ach", reference: "ACH-1" }),
      pm.trust.disbursements.payOwner({ items: [{ agreementId: ids.agreement, amountCents: 115_000 }], entryDate: "2026-11-12", method: "ach", reference: "ACH-2" }),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
  });

  it("owner portal: invite, accept, approve an expense; overdraw blocked until the owner funds it", async () => {
    const pm = caller("pm");
    const inv = await pm.trust.owners.invite({ ownerId: ids.owner });
    expect(inv.emailed).toBe(false); // no email service in tests → link returned
    const token = new URL(inv.link!).searchParams.get("invite")!;
    await caller("ownerUser").trust.ownerPortal.acceptInvite({ token });
    await expect(caller("ownerUser").trust.ownerPortal.acceptInvite({ token })).rejects.toThrow(/invalid|used/);

    const sub = await pm.trust.expenses.submit({ agreementId: ids.agreement, amountCents: 60_000, payee: "Ace Plumbing", description: "Water heater", entryDate: "2026-11-14", method: "check", reference: "1043" });
    expect(sub.status).toBe("pending_approval");
    const portal = await caller("ownerUser").trust.ownerPortal.overview();
    expect(portal[0].properties[0].balanceCents).toBe(35_000);
    expect(portal[0].approvals).toHaveLength(1);
    await caller("ownerUser").trust.ownerPortal.decideApproval({ approvalId: (sub as any).approvalId, approve: true });
    // spendable = 35,000 − 15,000 accrued fees = 20,000 < 60,000
    await expect(pm.trust.approvals.payApproved({ approvalId: (sub as any).approvalId, entryDate: "2026-11-14", method: "check", reference: "1043" })).rejects.toThrow(/available/);
    await pm.trust.receipts.ownerContribution({ agreementId: ids.agreement, amountCents: 50_000, entryDate: "2026-11-14", receivedDate: "2026-11-13", method: "ach", reference: "OWN-1" });
    const paid = await pm.trust.approvals.payApproved({ approvalId: (sub as any).approvalId, entryDate: "2026-11-14", method: "check", reference: "1043" });
    expect(paid.journalEntryId).toBeTruthy();
  });

  it("pays accrued fees out of trust as one itemized disbursement", async () => {
    const r = await caller("pm").trust.fees.pay({ trustAccountId: ids.account, entryDate: "2026-11-15", method: "transfer", reference: "XFER-1" });
    expect(r).toMatchObject({ count: 1, totalCents: 15_000 });
    expect(await caller("pm").trust.fees.list()).toHaveLength(0);
  });

  it("company funds: capped at $100", async () => {
    await expect(caller("pm").trust.receipts.companyFunds({ trustAccountId: ids.account, amountCents: 10_001, entryDate: "2026-11-02" })).rejects.toThrow(/capped/);
    await caller("pm").trust.receipts.companyFunds({ trustAccountId: ids.account, amountCents: 5_000, entryDate: "2026-11-02", reference: "CO-1" });
  });

  it("autopay invoice: rent + deposit split, leasing fee accrued; wrong destination ignored", async () => {
    const { afterRentInvoicePaid } = await import("./trust/stripeHooks");
    const Stripe = (await import("stripe")).default as any;
    const stripe = new Stripe("sk");
    const lst = await d.insert(schema.marketplaceListings).values({ userId: ids.pm, title: "Elm", address: `${tag} Elm St`, city: "Fayetteville", state: "NC", monthlyRent: 1500, bedrooms: "2", bathrooms: "1", status: "private" });
    const listingId = Number(lst[0].insertId);
    await d.update(schema.crmProperties).set({ listingId }).where(eq(schema.crmProperties.id, ids.property));
    const le = await d.insert(schema.leaseAgreements).values({ landlordUserId: ids.pm, listingId, tenantName: "Tina Tenant", tenantEmail: `tina-${tag}@trust.test`, state: "NC", propertyAddress: `${tag} Elm St`, monthlyRent: 150_000, securityDeposit: 150_000, leaseStartDate: "2026-12-01", status: "awaiting_payment" });
    const leaseId = Number(le[0].insertId);
    // Lease autopay checkout routes to the PM too
    await appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} } as any, res: {} as any }).leases.createPaymentSession({ leaseId, tenantEmail: `tina-${tag}@trust.test` });
    expect(stripeCalls.sessions.at(-1).subscription_data.transfer_data.destination).toBe("acct_pm_test");
    expect(stripeCalls.sessions.at(-1).subscription_data.metadata.trustAgreementId).toBe(String(ids.agreement));

    const [lease] = await d.select().from(schema.leaseAgreements).where(eq(schema.leaseAgreements.id, leaseId));
    const inv: any = { id: `in_${tag}`, number: "INV-1", billing_reason: "subscription_create", amount_paid: 300_000, transfer_data: { destination: "acct_pm_test" }, status_transitions: { paid_at: Math.floor(Date.parse("2026-11-20T12:00:00Z") / 1000) }, lines: { data: [{ amount: 150_000, description: "Monthly rent", parent: { type: "subscription_item_details" } }, { amount: 150_000, description: "Security deposit — Elm" }] } };
    const before = await journalSum(ids.account);
    await afterRentInvoicePaid({ ...inv, transfer_data: { destination: "acct_landlord_test" }, id: `in_wrong_${tag}` }, lease, "2026-12-01", stripe);
    expect(await journalSum(ids.account)).toBe(before);
    await afterRentInvoicePaid(inv, lease, "2026-12-01", stripe);
    await afterRentInvoicePaid(inv, lease, "2026-12-01", stripe); // webhook retry
    expect(await journalSum(ids.account)).toBe(before + 300_000);
    const fees = await caller("pm").trust.fees.list();
    expect(fees.map((f: any) => [f.type, f.amountCents]).sort()).toEqual([["leasing_fee", 75_000], ["mgmt_fee", 15_000]]);
  });

  it("three-way reconciliation: import CSV, auto-match, record bank fee, finalize", async () => {
    const pm = caller("pm");
    const { id: reconId } = await pm.trust.recon.start({ trustAccountId: ids.account, periodMonth: "2026-11" });
    // No statement yet: uncleared items make the totals agree trivially, so it must not count as balanced.
    expect((await pm.trust.recon.get({ reconId })).recon.status).toBe("draft");
    await expect(pm.trust.recon.finalize({ reconId })).rejects.toThrow(/bank statement/);
    const journal = await pm.trust.journal.list({ trustAccountId: ids.account, to: "2026-11-30" });
    // Bank saw everything except the plumber's check #1043 (outstanding); the Nov 20 autopay arrives Dec 1 (in transit).
    const cleared = journal.filter((j: any) => j.reference !== "1043" && j.entryDate !== "2026-11-20" && !j.purpose.startsWith("REVERSAL"));
    const fmt = (c: number) => (c / 100).toFixed(2);
    const toUs = (ymd: string) => `${ymd.slice(5, 7)}/${ymd.slice(8, 10)}/${ymd.slice(0, 4)}`;
    const rows = [["Posting Date", "Description", "Amount", "Check or Slip #"], ...cleared.map((j: any) => [toUs(j.entryDate === "2026-11-03" ? "2026-11-05" : j.entryDate), j.counterparty, fmt(j.amountCents), j.reference ?? ""]), ["11/30/2026", "MONTHLY SERVICE FEE", "-12.00", ""]];
    const bankEnding = cleared.reduce((s: number, j: any) => s + j.amountCents, 0) - 1_200;
    const res = await pm.trust.recon.importCsv({ reconId, rows, bankEndingBalanceCents: bankEnding, fileName: "nov.csv" });
    expect(res.matched).toBe(cleared.length);
    expect(res.result.unmatchedBankLines).toHaveLength(1);
    await expect(pm.trust.recon.finalize({ reconId })).rejects.toThrow();
    const line = res.result.unmatchedBankLines[0];
    const after = await pm.trust.recon.recordBankCharge({ reconId, lineId: line.id });
    expect(after.outstandingChecksCents).toBe(60_000);
    expect(after.depositsInTransitCents).toBe(300_000);
    expect(after.journalBalanceCents).toBe(after.trialBalanceCents);
    expect(after.adjustedBankBalanceCents).toBe(after.journalBalanceCents);
    expect(after.balanced).toBe(true);
    await pm.trust.recon.finalize({ reconId, notes: "Nov reconciled" });
    await expect(pm.trust.recon.importCsv({ reconId, rows, bankEndingBalanceCents: bankEnding })).rejects.toThrow(/finalized/);
  });

  it("closes a security deposit with itemized deductions and refund", async () => {
    const deps = await caller("pm").trust.deposits.list();
    const sd = deps.find((x: any) => x.receivedDate === "2026-11-04");
    const r = await caller("pm").trust.deposits.close({ securityDepositId: sd.id, tenancyEndDate: "2026-11-25", deductions: [{ description: "Carpet cleaning", amountCents: 20_000 }], refundMethod: "check", refundReference: "1050", entryDate: "2026-11-28", emailTenant: false });
    expect(r).toMatchObject({ heldCents: 150_000, deductedCents: 20_000, refundCents: 130_000 });
    await expect(caller("pm").trust.deposits.close({ securityDepositId: sd.id, tenancyEndDate: "2026-11-25", deductions: [], refundMethod: "check", entryDate: "2026-11-28" })).rejects.toThrow(/already/);
  });

  it("reversal posts the opposite entry once", async () => {
    const pm = caller("pm");
    // Company funds can't be reversed below what bank charges already used.
    const co = (await pm.trust.journal.list({ trustAccountId: ids.account })).find((x: any) => x.reference === "CO-1");
    await expect(pm.trust.journal.reverse({ journalEntryId: co.id, reason: "mistake", entryDate: "2026-12-02" })).rejects.toThrow(/company-funds/);
    // Void the plumber's uncashed check #1043: the money returns to the owner's ledger.
    const j = (await pm.trust.journal.list({ trustAccountId: ids.account })).find((x: any) => x.reference === "1043");
    await pm.trust.journal.reverse({ journalEntryId: j.id, reason: "check voided", entryDate: "2026-12-02" });
    await expect(pm.trust.journal.reverse({ journalEntryId: j.id, reason: "again", entryDate: "2026-12-02" })).rejects.toThrow(/already/);
  });

  it("ledgers always sum to the journal", async () => {
    expect(await ledgerSum(ids.account)).toBe(await journalSum(ids.account));
  });

  it("statement PDF, send, and 1099 totals", async () => {
    const pm = caller("pm");
    const st = await pm.trust.statements.preview({ ownerId: ids.owner, periodMonth: "2026-11" });
    expect(st.totals.incomeCents).toBe(150_000 + 150_000 + 50_000 + 20_000); // stripe rent, autopay rent, owner contribution, deposit applied
    const pdf = await pm.trust.statements.pdf({ ownerId: ids.owner, periodMonth: "2026-11" });
    expect(Buffer.from(pdf.base64, "base64").subarray(0, 8).toString()).toBe("%PDF-1.4");
    const sent = await pm.trust.statements.send({ periodMonth: "2026-11", ownerIds: [ids.owner] });
    expect(sent.results[0].emailed).toBe(false);
    const portalPdf = await caller("ownerUser").trust.ownerPortal.statementPdf({ ownerId: ids.owner, periodMonth: "2026-11" });
    expect(portalPdf.base64.length).toBeGreaterThan(1000);
    const t = await pm.trust.owner1099({ year: 2026 });
    expect(t.find((x: any) => x.owner.id === ids.owner)).toMatchObject({ grossRentsCents: 320_000, reportable: true });
  });

  it("staff permissions: view-only staff can read but not disburse", async () => {
    const pm = caller("pm");
    await pm.trust.staff.invite({ email: `staff-${tag}@trust.test`, canRecordReceipts: true, canDisburse: false, canReconcile: false, canManageOwners: false });
    const staff = caller("staff");
    const access = await staff.trust.access();
    expect(access.books.some((b: any) => b.pmUserId === ids.pm && !b.perms.disburse)).toBe(true);
    const ov = await staff.trust.overview({ bookUserId: ids.pm });
    expect(ov.pmUserId).toBe(ids.pm);
    await expect(staff.trust.disbursements.payOwner({ bookUserId: ids.pm, items: [{ agreementId: ids.agreement, amountCents: 100 }], entryDate: "2026-12-01", method: "ach" })).rejects.toThrow(/permission/);
    await expect(caller("freeUser").trust.overview({ bookUserId: ids.pm })).rejects.toThrow(/permission/);
  });

  it("can't end an agreement while money is held", async () => {
    await expect(caller("pm").trust.agreements.terminate({ agreementId: ids.agreement, endDate: "2026-12-31" })).rejects.toThrow(/Pay out/);
  });

  it("processing fee: self-managed rent — Stripe's fee reversed from the landlord's transfer and booked as an expense, once", async () => {
    const { handleRentCheckoutSession } = await import("./trust/stripeHooks");
    const Stripe = (await import("stripe")).default as any;
    const stripe = new Stripe("sk");
    stripeCalls.fee = 500; // ACH 0.8% of $1,200 = $9.60, capped at $5
    const session: any = { id: "cs_self", payment_intent: `pi_self_${tag}`, payment_status: "paid", created: Math.floor(Date.parse("2026-12-03T15:00:00Z") / 1000), metadata: { leaselyPaymentId: String(ids.landlordPayment) } };
    await handleRentCheckoutSession(stripe, session, "checkout.session.completed");
    await handleRentCheckoutSession(stripe, session, "checkout.session.completed"); // webhook retry
    const rev = stripeCalls.reversals.get(`kc-processing-fee-ch_pi_self_${tag}`);
    expect(rev).toMatchObject({ transferId: `tr_pi_self_${tag}`, amount: 500 });
    const entries = await d.select().from(schema.accountingEntries).where(eq(schema.accountingEntries.userId, ids.landlord));
    expect(entries.filter((e: any) => e.description === `Stripe processing fee · ch_pi_self_${tag}`)).toEqual([expect.objectContaining({ type: "expense", category: "other_expense", amount: 500, date: "2026-12-03" })]);
  });

  it("processing fee: managed rent — deducted from the PM's payout, posted to the trust journal and owner ledger", async () => {
    const { afterRentInvoicePaid } = await import("./trust/stripeHooks");
    const Stripe = (await import("stripe")).default as any;
    const stripe = new Stripe("sk");
    stripeCalls.fee = 500;
    const [lease] = await d.select().from(schema.leaseAgreements).where(eq(schema.leaseAgreements.landlordUserId, ids.pm));
    const inv: any = { id: `in_fee_${tag}`, payment_intent: `pi_mgd_${tag}`, billing_reason: "subscription_cycle", amount_paid: 150_000, transfer_data: { destination: "acct_pm_test" }, status_transitions: { paid_at: Math.floor(Date.parse("2026-12-05T12:00:00Z") / 1000) }, lines: { data: [{ amount: 150_000, description: "Monthly rent", parent: { type: "subscription_item_details" } }] } };
    const before = await journalSum(ids.account);
    await afterRentInvoicePaid(inv, lease, "2026-12-01", stripe);
    await afterRentInvoicePaid(inv, lease, "2026-12-01", stripe); // retry
    expect(await journalSum(ids.account)).toBe(before + 150_000 - 500);
    const feeRows = await d.select().from(schema.trustJournalEntries).where(eq(schema.trustJournalEntries.sourceKey, `stripe_fee:ch_pi_mgd_${tag}`));
    expect(feeRows).toEqual([expect.objectContaining({ amountCents: -500, method: "stripe", counterparty: "Stripe", stripePaymentIntentId: `pi_mgd_${tag}` })]);
    const lines = await d.select().from(schema.trustLedgerEntries).where(eq(schema.trustLedgerEntries.journalEntryId, feeRows[0].id));
    expect(lines).toEqual([expect.objectContaining({ ledgerType: "owner", type: "expense", amountCents: -500, trustOwnerId: ids.owner })]);
    expect(stripeCalls.reversals.get(`kc-processing-fee-ch_pi_mgd_${tag}`)).toMatchObject({ amount: 500 });
    // Not booked to the PM's own Accounting: it's owner money in trust.
    const pmEntries = await d.select().from(schema.accountingEntries).where(eq(schema.accountingEntries.userId, ids.pm));
    expect(pmEntries.some((e: any) => e.description?.includes(`ch_pi_mgd_${tag}`))).toBe(false);
    expect(await ledgerSum(ids.account)).toBe(await journalSum(ids.account));
  });

  it("processing fee: kill switch leaves payouts untouched", async () => {
    const { recoverProcessingFee } = await import("./payments/processingFee");
    const Stripe = (await import("stripe")).default as any;
    process.env.PROCESSING_FEE_PASSTHROUGH = "off";
    const r = await recoverProcessingFee(new Stripe("sk"), { paymentIntentId: `pi_off_${tag}`, landlordUserId: ids.landlord, date: "2026-12-06" });
    delete process.env.PROCESSING_FEE_PASSTHROUGH;
    expect(r.status).toBe("skipped");
    expect(stripeCalls.reversals.has(`kc-processing-fee-ch_pi_off_${tag}`)).toBe(false);
    stripeCalls.fee = 0;
  });
});
