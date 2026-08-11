import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { EntryGem } from "@/components/motion/entry-gem";
import { cn } from "@/lib/cn";

const ACTIVITY_LABEL: Record<string, string> = {
  submitted: "submitted their profile",
  approved: "was approved",
  changes_requested: "was sent changes to make",
};

export default async function AdminOverviewPage() {
  const [teamCount, pendingCount, projectCount, recentInvites, recentActivity] = await Promise.all([
    prisma.teamProfile.count({ where: { hasBeenPublished: true } }),
    prisma.teamProfile.count({ where: { status: "pending" } }),
    prisma.project.count(),
    prisma.invite.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.profileActivity.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { teamProfile: { select: { name: true, slug: true } } },
    }),
  ]);

  // Icons reuse the same faceted gold-gradient SVG set as the public
  // services teaser (docs/icon-*.svg → public/icons/*.svg) rather than
  // inventing a second icon language for admin.
  const stats = [
    { label: "Team members", value: teamCount, icon: "/icons/community.svg" },
    {
      label: "Pending reviews",
      value: pendingCount,
      icon: "/icons/check-diamond.svg",
      href: pendingCount > 0 ? "/admin/reviews" : undefined,
      attention: pendingCount > 0,
    },
    { label: "Projects", value: projectCount, icon: "/icons/web3-dev.svg" },
  ];

  return (
    <Reveal onMount className="flex flex-col gap-10">
      {/* First admin page of a session only (EntryGem gates it) — the
          full assembling-gem moment, same one sign-in gets, per the
          motion-parity correction. Everyday admin visits after that just
          see the settled mark, no replay. */}
      <RevealItem>
        <EntryGem storageKey="admin-gem" size="w-24" />
      </RevealItem>

      <RevealItem>
        <h1 className="font-display text-xl font-bold text-ink">Overview</h1>
      </RevealItem>

      <RevealItem className="grid grid-cols-2 gap-4 min-[601px]:grid-cols-3">
        {stats.map((stat) => {
          const content = (
            <>
              <Image src={stat.icon} alt="" width={32} height={32} className="mb-3" />
              {/* Gold-tinted rather than a literal gradient clip on the
                  number — SPEC.md's "no gradient text" rule still holds
                  for anything headline-sized; this is the "subtle gold
                  accent" branch of that choice, not the gradient one. */}
              <p className="mb-1 text-3xl font-bold text-gold-light">{stat.value}</p>
              <p className="text-sm text-ink-dim">{stat.label}</p>
            </>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              <AdminPanel glow className={cn(stat.attention && "admin-attention-glow border-[rgba(212,175,55,0.4)]")}>
                {content}
              </AdminPanel>
            </Link>
          ) : (
            <AdminPanel key={stat.label} glow>
              {content}
            </AdminPanel>
          );
        })}
      </RevealItem>

      <div className="grid gap-6 min-[901px]:grid-cols-2">
        <RevealItem>
          <h2 className="mb-3 font-display text-base font-bold text-ink">Recent invites</h2>
          <AdminPanel>
            {recentInvites.length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                {recentInvites.map((invite) => (
                  <li key={invite.id} className="text-sm text-ink-dim">
                    <span className="text-ink">{invite.email}</span> —{" "}
                    {invite.usedAt ? "active" : invite.revokedAt ? "revoked" : "invited"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-dim">No invites sent yet.</p>
            )}
            <Link href="/admin/invites" className="mt-3 inline-block text-sm text-gold underline-offset-2 hover:underline">
              Manage invites →
            </Link>
          </AdminPanel>
        </RevealItem>

        <RevealItem>
          <h2 className="mb-3 font-display text-base font-bold text-ink">Recent activity</h2>
          <AdminPanel>
            {recentActivity.length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                {recentActivity.map((entry) => (
                  <li key={entry.id} className="text-sm text-ink-dim">
                    <span className="text-ink">{entry.teamProfile.name}</span>{" "}
                    {ACTIVITY_LABEL[entry.type] ?? entry.type}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-dim">Nothing yet.</p>
            )}
          </AdminPanel>
        </RevealItem>
      </div>
    </Reveal>
  );
}
