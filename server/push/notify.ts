/**
 * Event helpers for things that previously had no email or in-app
 * notification. Each writes an in-app notification (the web bell), which
 * createNotification mirrors to the user's phones.
 */
import { createNotification } from "../db";

/** Landlord gets "New application" when someone applies to their listing. */
export function notifyNewApplication(opts: { landlordUserId: number; applicantName: string; applicationId: number }): void {
  void createNotification({
    userId: opts.landlordUserId,
    type: "application_submitted",
    title: "New rental application",
    body: `${opts.applicantName} just applied. Review and screen them in Keycove.`,
    link: "/applications",
  }).catch((err) => console.warn("[Push] new-application notification failed:", err));
}
