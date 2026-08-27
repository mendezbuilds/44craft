import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminButton } from "@/components/admin/admin-button";
import { StatusBadge } from "@/components/admin/status-badge";
import type { ProfileSnapshot } from "@/lib/team-profile";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";
import { DeleteTeamMemberButton } from "@/components/admin/delete-team-member-button";

const PROFILE_TONE = {
  draft: "neutral",
  pending: "warning",
  published: "positive",
} as const;

export default async function AdminTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const profile = await prisma.teamProfile.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, status: true } } },
  });
  if (!profile) notFound();

  // Prefer the last-published snapshot (what the public site shows); fall
  // back to the live columns for a member who's never been published.
  const snapshot = (profile.publishedVersion as ProfileSnapshot | null) ?? {
    name: profile.name,
    roleTitle: profile.roleTitle,
    photo: profile.photo,
    bio: profile.bio ?? "",
    skills: profile.skills,
    socials: (profile.socials as ProfileSnapshot["socials"] | null) ?? {},
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/team" className="text-sm text-ink-dim hover:text-ink">
          ← Team
        </Link>
      </div>

      <AdminPanel>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {snapshot.photo ? (
              <Image src={snapshot.photo} alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-full object-cover" />
            ) : (
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)] text-xs text-ink-dim">
                no photo
              </div>
            )}
            <div>
              <h1 className="font-display text-xl font-bold text-ink">{snapshot.name}</h1>
              <p className="text-sm text-ink-dim">{snapshot.roleTitle}</p>
              <p className="mt-1 text-xs text-ink-dim">{profile.user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge label={`profile: ${profile.status}`} tone={PROFILE_TONE[profile.status]} />
                <StatusBadge
                  label={`account: ${profile.user.status}`}
                  tone={profile.user.status === "active" ? "positive" : "negative"}
                />
                {profile.hasBeenPublished && <StatusBadge label="live on site" tone="positive" />}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {profile.hasBeenPublished && (
              <AdminButton href={`/team/${profile.slug}`} variant="ghost">
                View public profile
              </AdminButton>
            )}
            <ToggleStatusButton userId={profile.user.id} status={profile.user.status} />
          </div>
        </div>

        {snapshot.bio && (
          <div className="mt-6 border-t border-[rgba(255,255,255,0.08)] pt-4">
            <p className="mb-1 font-mono text-[11px] tracking-wide text-ink-dim uppercase">Bio</p>
            <p className="text-sm whitespace-pre-wrap text-ink-dim">{snapshot.bio}</p>
          </div>
        )}

        {snapshot.skills.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 font-mono text-[11px] tracking-wide text-ink-dim uppercase">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {snapshot.skills.map((skill) => (
                <span key={skill} className="rounded-full border border-[rgba(255,255,255,0.14)] px-2 py-0.5 font-mono text-xs text-ink-dim">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {Object.values(snapshot.socials).some(Boolean) && (
          <div className="mt-4">
            <p className="mb-1.5 font-mono text-[11px] tracking-wide text-ink-dim uppercase">Socials</p>
            <ul className="flex flex-col gap-0.5 text-sm text-ink-dim">
              {Object.entries(snapshot.socials)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <li key={k}>
                    {k}: {v}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {profile.status === "pending" && (
          <div className="mt-6 border-t border-[rgba(255,255,255,0.08)] pt-4">
            <p className="text-sm text-ink-dim">
              This profile has changes awaiting review.{" "}
              <Link href="/admin/reviews" className="text-ink underline-offset-2 hover:underline">
                Go to reviews →
              </Link>
            </p>
          </div>
        )}
      </AdminPanel>

      {/* Its own panel, well below the deactivate/reactivate control above
          — an irreversible delete has no business sharing a row with a
          reversible one where a misclick could hit the wrong button. */}
      <AdminPanel className="border-red-500/20">
        <p className="mb-1 font-mono text-[11px] tracking-wide text-red-400 uppercase">Danger zone</p>
        <p className="mb-4 text-sm text-ink-dim">Permanently remove this person instead of just deactivating them.</p>
        <DeleteTeamMemberButton profileId={profile.id} name={profile.name} />
      </AdminPanel>
    </div>
  );
}
