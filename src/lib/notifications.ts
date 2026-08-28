import { resend, EMAIL_FROM } from "@/lib/resend";
import { emailShell } from "@/lib/email-template";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://44craft.com";

/**
 * The "changes requested" email — originally only sent from
 * rejectProfileAction (admin/reviews), now also sent from
 * requestProfileUpdateAction (admin/team, a proactive nudge with no
 * pending submission to reject). Same trigger/template either way, per
 * SPEC.md Section 10 — pulled out so there's one copy of the actual
 * email content instead of two call sites drifting from each other.
 */
export async function sendChangesRequestedEmail(to: string, note: string) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "A few tweaks needed on your profile",
    html: emailShell({
      preheader: "An admin left a note on your profile.",
      statusLabel: "Changes requested",
      heading: "A few tweaks needed.",
      paragraphs: [
        "An admin reviewed your profile. A few changes before it goes live:",
        `<span style="color:#F2EEFF;font-style:italic;">"${note.replace(/</g, "&lt;")}"</span>`,
        "Update it and resubmit whenever you're ready.",
      ],
      ctaLabel: "Update your profile",
      ctaUrl: `${APP_URL}/dashboard/profile`,
    }),
  });
}
