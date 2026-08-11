"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { acceptInviteSchema } from "@/lib/validation";
import { getValidInvite } from "@/lib/accept-invite";

export type AcceptInviteState = { error?: string };

export async function acceptInviteAction(
  _prevState: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const parsed = acceptInviteSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }
  const { token, password } = parsed.data;

  const { invite, error } = await getValidInvite(token);
  if (!invite) {
    return { error: error ?? "This invite link is invalid." };
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
    app_metadata: { role: invite.role },
  });

  if (createError || !created.user) {
    return { error: "Could not create your account. Try again or ask for a new invite." };
  }

  await prisma.$transaction([
    prisma.user.create({
      data: { id: created.user.id, email: invite.email, role: invite.role },
    }),
    prisma.invite.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ]);

  // Sign the new user in so they land in the dashboard with a live session.
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email: invite.email, password });

  redirect("/dashboard");
}
