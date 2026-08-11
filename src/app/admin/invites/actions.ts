"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { emailShell } from "@/lib/email-template";
import { generateInviteToken, inviteExpiryDate } from "@/lib/invites";
import { sendInviteSchema } from "@/lib/validation";

export type SendInviteState = { error?: string; success?: string };

export async function sendInviteAction(
  _prevState: SendInviteState,
  formData: FormData,
): Promise<SendInviteState> {
  const admin = await requireAdmin();

  const parsed = sendInviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }
  const { email, role } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "That email already has an account." };
  }

  const existingInvite = await prisma.invite.findFirst({
    where: { email, usedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
  });
  if (existingInvite) {
    return { error: "There's already an active invite for that email." };
  }

  const token = generateInviteToken();
  const expiresAt = inviteExpiryDate();

  await prisma.invite.create({
    data: { token, email, role, expiresAt, invitedById: admin.id },
  });

  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite/${token}`;

  const { error: emailError } = await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "You've been invited to join 44Craft",
    html: emailShell({
      preheader: "An admin invited you to join the 44Craft team.",
      heading: "You're in.",
      paragraphs: ["An admin invited you to join the 44Craft team. Set your password and you're ready to go."],
      ctaLabel: "Accept your invite",
      ctaUrl: acceptUrl,
      footnote: "This link expires in 7 days. Didn't expect this? You can ignore it.",
    }),
  });

  if (emailError) {
    return { error: "Invite was created but the email failed to send." };
  }

  revalidatePath("/admin/invites");
  revalidatePath("/admin");
  return { success: `Invite sent to ${email}.` };
}

export type RevokeInviteState = { error?: string; success?: string };

// Returns state (was void) so the row's client-side button can show a
// loading spinner and toast the result — see revoke-invite-button.tsx.
export async function revokeInviteAction(
  _prevState: RevokeInviteState,
  formData: FormData,
): Promise<RevokeInviteState> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing invite id." };

  const result = await prisma.invite.updateMany({
    where: { id, usedAt: null },
    data: { revokedAt: new Date() },
  });
  if (result.count === 0) {
    return { error: "That invite can no longer be revoked." };
  }

  revalidatePath("/admin/invites");
  return { success: "Invite revoked." };
}
