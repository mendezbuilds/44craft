import "server-only";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Resolves the current Supabase session to our own User row. This is the
 * source of truth for authorization — proxy.ts only does a coarse,
 * UX-level redirect; every privileged layout/action re-checks here.
 *
 * Deactivated accounts (admin/team, Phase 6 team-management) resolve to
 * null here rather than being filtered at each call site — that's what
 * makes deactivation actually take effect: dashboard/admin layouts treat
 * null as "not signed in" and redirect to /signin, and requireUser/
 * requireAdmin throw the same "Not authenticated" a signed-out caller
 * would get.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!user || user.status === "deactivated") return null;

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Not authorized");
  return user;
}
