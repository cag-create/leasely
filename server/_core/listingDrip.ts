/**
 * Listing drip email scheduler.
 *
 * Runs once daily. Finds active listings with no photos and emails the landlord:
 *
 *   Day 1 after creation — photo nudge: "your listing has no photos"
 *   Day 3 after creation — upgrade pitch: photos + Pro benefits + CTA to upgrade
 *
 * Idempotent: tracks sent timestamps on marketplace_listings.photoNudgeSentAt
 * and upgradeNudgeSentAt so milestones never re-fire.
 *
 * Free-tier check: upgrade email only fires for users without an active paid sub.
 */
import { and, eq, isNull, lte, or } from "drizzle-orm";
import { getDb } from "../db";
import { marketplaceListings, users, userSubscriptions } from "../../drizzle/schema";
import { sendEmail } from "./email";

const DAY_MS = 24 * 60 * 60 * 1000;

function hasNoPhotos(photos: string | null | undefined): boolean {
  if (!photos) return true;
  try { return JSON.parse(photos).length === 0; } catch { return true; }
}

function photoNudgeHtml(name: string, title: string, listingId: number): string {
  const dashUrl = `${process.env.APP_URL ?? "https://leasely.net"}/my-listings`;
  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:580px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#1B2B5E,#00C896);padding:24px 28px;border-radius:10px 10px 0 0;color:white">
    <h1 style="margin:0;font-size:20px;font-weight:800">Your listing is missing photos 📷</h1>
  </div>
  <div style="background:#f9fafb;padding:24px 28px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    <p style="margin:0 0 14px;color:#111827">Hi ${name},</p>
    <p style="margin:0 0 14px;color:#374151">Your listing <strong>"${title}"</strong> is live on Keycove — but it has <strong>no photos yet</strong>.</p>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin:0 0 20px">
      <p style="margin:0;color:#92400e;font-size:14px">
        📊 Listings with photos get <strong>5–10× more views</strong> than photo-free ones. Most renters skip blank listings entirely.
      </p>
    </div>
    <p style="margin:0 0 14px;color:#374151;font-size:14px">It takes less than 2 minutes — just log in, open your listing, and upload a few shots straight from your phone.</p>
    <a href="${dashUrl}"
       style="display:block;background:#4F46E5;color:white;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;text-align:center;margin-bottom:16px">
      Upload Photos Now →
    </a>
    <p style="margin:0;color:#9ca3af;font-size:12px">Sent by <a href="https://leasely.net" style="color:#1B2B5E">Keycove</a> · <a href="${process.env.APP_URL ?? "https://leasely.net"}/unsubscribe" style="color:#9ca3af">Unsubscribe</a></p>
  </div>
</div>`;
}

function upgradeNudgeHtml(name: string, title: string): string {
  const upgradeUrl = `${process.env.APP_URL ?? "https://leasely.net"}/pricing`;
  const dashUrl = `${process.env.APP_URL ?? "https://leasely.net"}/my-listings`;
  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:580px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#1B2B5E,#4F46E5);padding:24px 28px;border-radius:10px 10px 0 0;color:white">
    <h1 style="margin:0;font-size:20px;font-weight:800">Still no photos — here's what you're missing</h1>
  </div>
  <div style="background:#f9fafb;padding:24px 28px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
    <p style="margin:0 0 14px;color:#111827">Hi ${name},</p>
    <p style="margin:0 0 14px;color:#374151">Your listing <strong>"${title}"</strong> still has no photos and is getting passed over by renters who are actively searching right now.</p>

    <div style="background:white;border:1px solid #e5e7eb;border-radius:10px;padding:18px;margin:0 0 20px">
      <p style="margin:0 0 12px;font-weight:700;color:#111827">Pro landlords on Keycove also get:</p>
      <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8">
        <li><strong>AI tenant screening</strong> — credit, background, income in 60 seconds</li>
        <li><strong>State-specific e-sign leases</strong> — legally binding, sent & signed in the app</li>
        <li><strong>Automated rent collection</strong> — ACH via Stripe, receipts sent automatically</li>
        <li><strong>Maintenance dispatch</strong> — tenants submit, you approve, vendors are notified</li>
        <li><strong>Unlimited listings</strong> — free tier is capped at 1</li>
      </ul>
    </div>

    <div style="display:flex;gap:10px;margin-bottom:16px">
      <a href="${upgradeUrl}"
         style="flex:1;display:block;background:#4F46E5;color:white;padding:13px 20px;border-radius:8px;text-decoration:none;font-weight:700;text-align:center">
        Upgrade to Pro →
      </a>
      <a href="${dashUrl}"
         style="flex:1;display:block;background:#f3f4f6;color:#374151;padding:13px 20px;border-radius:8px;text-decoration:none;font-weight:600;text-align:center;border:1px solid #e5e7eb">
        Add Photos
      </a>
    </div>
    <p style="margin:0;color:#9ca3af;font-size:12px">Sent by <a href="https://leasely.net" style="color:#1B2B5E">Keycove</a> · <a href="${process.env.APP_URL ?? "https://leasely.net"}/unsubscribe" style="color:#9ca3af">Unsubscribe</a></p>
  </div>
</div>`;
}

export async function runListingDripSweep(): Promise<{ photoNudge: number; upgradeNudge: number; errors: number }> {
  const db = await getDb();
  if (!db) return { photoNudge: 0, upgradeNudge: 0, errors: 0 };

  const result = { photoNudge: 0, upgradeNudge: 0, errors: 0 };
  const now = new Date();
  const day1Cutoff = new Date(now.getTime() - DAY_MS);
  const day3Cutoff = new Date(now.getTime() - 3 * DAY_MS);

  // All active listings created more than 1 day ago where at least one nudge hasn't been sent
  const listings = await db
    .select({
      id: marketplaceListings.id,
      userId: marketplaceListings.userId,
      title: marketplaceListings.title,
      photos: marketplaceListings.photos,
      createdAt: marketplaceListings.createdAt,
      photoNudgeSentAt: (marketplaceListings as any).photoNudgeSentAt,
      upgradeNudgeSentAt: (marketplaceListings as any).upgradeNudgeSentAt,
    })
    .from(marketplaceListings)
    .where(
      and(
        eq(marketplaceListings.status, "active"),
        lte(marketplaceListings.createdAt, day1Cutoff),
      )
    );

  for (const listing of listings) {
    if (!hasNoPhotos(listing.photos)) continue; // has photos — skip

    try {
      // Get owner
      const ownerRows = await db.select({ name: users.name, email: users.email })
        .from(users).where(eq(users.id, listing.userId)).limit(1);
      const owner = ownerRows[0];
      if (!owner?.email) continue;

      const name = owner.name || owner.email.split("@")[0];
      const createdAt = new Date(listing.createdAt);

      // Day 1 photo nudge
      if (!listing.photoNudgeSentAt && createdAt <= day1Cutoff) {
        await sendEmail({
          to: owner.email,
          subject: `${name}, your listing needs photos to get noticed`,
          html: photoNudgeHtml(name, listing.title, listing.id),
        });
        await db.update(marketplaceListings)
          .set({ updatedAt: now, ...({"photoNudgeSentAt": now} as any) })
          .where(eq(marketplaceListings.id, listing.id));
        result.photoNudge++;
      }

      // Day 3 upgrade nudge — only for free-tier users
      if (!listing.upgradeNudgeSentAt && createdAt <= day3Cutoff) {
        const subRows = await db.select({ tier: userSubscriptions.tier })
          .from(userSubscriptions)
          .where(and(eq(userSubscriptions.userId, listing.userId), eq(userSubscriptions.status, "active")))
          .limit(1);
        const tier = subRows[0]?.tier ?? "free";
        if (tier !== "paid") {
          await sendEmail({
            to: owner.email,
            subject: `Still no photos on your listing — here's what Pro landlords get`,
            html: upgradeNudgeHtml(name, listing.title),
          });
          await db.update(marketplaceListings)
            .set({ updatedAt: now, ...({"upgradeNudgeSentAt": now} as any) })
            .where(eq(marketplaceListings.id, listing.id));
          result.upgradeNudge++;
        }
      }
    } catch (err) {
      console.warn(`[listingDrip] error for listing ${listing.id}:`, err);
      result.errors++;
    }
  }

  return result;
}

let schedulerHandle: ReturnType<typeof setInterval> | null = null;

export function startListingDripScheduler(): void {
  if (schedulerHandle) clearInterval(schedulerHandle);
  // First sweep 2 min after boot
  setTimeout(() => {
    void runListingDripSweep().then(r => {
      if (r.photoNudge || r.upgradeNudge || r.errors) {
        console.log(`[listingDrip] boot sweep: photoNudge=${r.photoNudge} upgradeNudge=${r.upgradeNudge} errors=${r.errors}`);
      }
    });
  }, 2 * 60 * 1000);
  // Then once every 24h
  schedulerHandle = setInterval(() => {
    void runListingDripSweep().then(r => {
      if (r.photoNudge || r.upgradeNudge || r.errors) {
        console.log(`[listingDrip] daily sweep: photoNudge=${r.photoNudge} upgradeNudge=${r.upgradeNudge} errors=${r.errors}`);
      }
    });
  }, 24 * 60 * 60 * 1000);
}
