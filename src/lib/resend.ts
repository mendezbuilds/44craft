import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Sandbox sender — can only deliver to the Resend account owner's own email
// until a custom domain is verified. Swap this when a real domain is ready.
export const EMAIL_FROM = "44Craft <onboarding@resend.dev>";
