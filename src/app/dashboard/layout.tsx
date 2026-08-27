import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

// Member-only, signed-in area — should never appear in search results.
export const metadata: Metadata = {
  title: { template: "%s — Dashboard — 44Craft", default: "Dashboard" },
  robots: { index: false, follow: false },
};

/**
 * Carries the brand feel (dark canvas, same type system) but stays calm —
 * no ConstellationBackground, no ambient motion. SPEC.md Section 9: the
 * big showcase moments (spark-burst, hero assembly) are exclusive to the
 * public site; this just isn't the plain admin-utility register either.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/signin?redirectTo=/dashboard");

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-6 py-4">
        <Link href="/dashboard" className="font-display text-sm font-bold tracking-[0.5px] text-ink">
          44CRAFT
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-dim">
          <Link href="/dashboard" className="transition-colors hover:text-ink">
            Dashboard
          </Link>
          <Link href="/dashboard/profile" className="transition-colors hover:text-ink">
            Edit profile
          </Link>
          {user.role === "admin" && (
            <Link href="/admin" className="transition-colors hover:text-ink">
              Admin
            </Link>
          )}
          <form action={signOutAction}>
            <button type="submit" className="transition-[color,opacity] duration-150 hover:text-ink active:opacity-60">
              Sign out
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto max-w-[900px] px-6 py-12">{children}</main>
    </div>
  );
}
