"use server";

import { resend, EMAIL_FROM } from "@/lib/resend";
import { contactSchema } from "@/lib/validation";

export type ContactState = { error?: string; success?: boolean };

/**
 * Emails via Resend only — SPEC.md Section 13 leaves "email only vs. also
 * stored in Supabase" unresolved. Defaulting to email-only per the Phase 3
 * brief; revisit if submissions need to be queryable/persisted later.
 */
export async function sendContactAction(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    projectType: formData.get("projectType"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: "Fill in your name, email, and a message." };
  }

  const to = process.env.CONTACT_EMAIL_TO;
  if (!to) {
    return { error: "Contact form isn't configured yet — missing CONTACT_EMAIL_TO." };
  }

  const { name, email, projectType, message } = parsed.data;

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    replyTo: email,
    subject: `New project inquiry from ${name}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${projectType ? `<p><strong>Project type:</strong> ${projectType}</p>` : ""}
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  });

  if (error) {
    return { error: "Something went wrong sending your message. Try again." };
  }

  return { success: true };
}
