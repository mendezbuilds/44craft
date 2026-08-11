import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";
import { AdminButton } from "@/components/admin/admin-button";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * Real lockup (same public/brand/logo-wordmark.png the public navbar
 * uses, background-removed from docs/1500x500 cover.png — its own
 * diamond is baked into the artwork) rather than the small invented
 * DiamondMark + plain "44CRAFT ADMIN" text this used before. The "Admin"
 * badge is what keeps it from reading as the public nav at a glance.
 */
function AdminLogo({ size }: { size: "sidebar" | "mobile" }) {
  return (
    <span className="flex items-center gap-2">
      <Image
        src="/brand/logo-wordmark.png"
        alt="44Craft"
        width={864}
        height={277}
        className={size === "sidebar" ? "h-5 w-auto" : "h-[18px] w-auto"}
      />
      <span className="rounded-full border border-[rgba(212,175,55,0.3)] px-2 py-0.5 font-mono text-[10px] tracking-[1.5px] text-gold uppercase">
        Admin
      </span>
    </span>
  );
}

/**
 * Own route group, own root layout — no shared public nav/footer.
 *
 * Design-correction pass (SPEC.md Section 8, supersedes the original
 * "calm/utility only" plan): admin now carries the full brand system —
 * gold accents, the diamond mark, icons, hover glow, card presence — same
 * craft as the public site, not a separately-toned panel. The one thing
 * still reserved for public pages specifically: the largest hero-scale
 * moments (assembling gem, full-screen spark-burst) — those stay exclusive
 * so they don't lose impact through daily repetition; smaller echoes (see
 * GoldBurst on the reviews page) are fair game here.
 *
 * Role gate is proxy.ts (coarse, UX-level redirect) + the check below
 * (authoritative) — unchanged from Phase 1, verified still correct here,
 * not rebuilt.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/signin?redirectTo=/admin");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-[rgba(255,255,255,0.08)] px-4 py-6 min-[801px]:flex">
          <Link href="/admin" className="mb-8 px-2">
            <AdminLogo size="sidebar" />
          </Link>
          <AdminNav variant="sidebar" />
          <form action={signOutAction} className="mt-auto">
            <AdminButton type="submit" variant="ghost" className="w-full px-2 py-2 text-sm">
              Sign out
            </AdminButton>
          </form>
        </aside>

        <div className="flex flex-1 flex-col">
          {/* Compact top bar on mobile, where the sidebar is hidden */}
          <header className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-4 py-3 min-[801px]:hidden">
            <AdminLogo size="mobile" />
            <form action={signOutAction}>
              <AdminButton type="submit" variant="ghost" className="px-3 py-1.5 text-xs">
                Sign out
              </AdminButton>
            </form>
          </header>
          <AdminNav variant="mobile" />

          <main className="flex-1 p-4 min-[801px]:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
