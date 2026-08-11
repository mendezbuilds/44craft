import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";

const PROFILE_TONE = {
  draft: "neutral",
  pending: "warning",
  published: "positive",
} as const;

/** Full roster, not just pending reviews — click through to any member's
 * full profile. Deactivate/reactivate lives on the detail page rather
 * than inline here, so it's a deliberate action, not a stray click. */
export default async function AdminTeamPage() {
  const profiles = await prisma.teamProfile.findMany({
    include: { user: { select: { id: true, email: true, status: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <Reveal onMount className="flex flex-col gap-6">
      <RevealItem>
        <h1 className="font-display text-xl font-bold text-ink">Team</h1>
      </RevealItem>

      {profiles.length === 0 ? (
        <RevealItem>
          <p className="text-sm text-ink-dim">No team members yet.</p>
        </RevealItem>
      ) : (
        <RevealItem>
          {/* Table on wider screens, stacked cards below 640px — same
              reasoning as invites/page.tsx: five columns don't fit a phone
              viewport without either scrolling or illegible squeezing. */}
          <table className="hidden w-full border-collapse text-sm min-[640px]:table">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)] text-left text-ink-dim">
                <th className="py-2 pr-4 font-normal">Name</th>
                <th className="py-2 pr-4 font-normal">Role</th>
                <th className="py-2 pr-4 font-normal">Email</th>
                <th className="py-2 pr-4 font-normal">Profile</th>
                <th className="py-2 pr-4 font-normal">Account</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-b border-[rgba(255,255,255,0.06)]">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/team/${profile.id}`} className="text-ink underline-offset-2 hover:underline">
                      {profile.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-ink-dim">{profile.roleTitle}</td>
                  <td className="py-3 pr-4 text-ink-dim">{profile.user.email}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge label={profile.status} tone={PROFILE_TONE[profile.status]} />
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge
                      label={profile.user.status}
                      tone={profile.user.status === "active" ? "positive" : "negative"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="flex flex-col gap-3 min-[640px]:hidden">
            {profiles.map((profile) => (
              <li key={profile.id}>
                <Link href={`/admin/team/${profile.id}`}>
                  <AdminPanel glow className="p-4">
                    <p className="mb-0.5 truncate font-display text-sm font-bold text-ink">{profile.name}</p>
                    <p className="mb-3 truncate text-sm text-ink-dim">
                      {profile.roleTitle} · {profile.user.email}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge label={profile.status} tone={PROFILE_TONE[profile.status]} />
                      <StatusBadge
                        label={profile.user.status}
                        tone={profile.user.status === "active" ? "positive" : "negative"}
                      />
                    </div>
                  </AdminPanel>
                </Link>
              </li>
            ))}
          </ul>
        </RevealItem>
      )}
    </Reveal>
  );
}
