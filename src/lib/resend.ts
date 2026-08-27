import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Real domain, verified in Resend — was the sandbox onboarding@resend.dev
// address (restricted to sending only to the account owner's own inbox)
// until now. Single source of truth for every outgoing email (invites,
// profile approved/changes-requested, featured-in-project, contact form).
export const EMAIL_FROM = "44Craft <hello@44craft.com>";
