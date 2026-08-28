import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminButton } from "@/components/admin/admin-button";
import { StatusBadge } from "@/components/admin/status-badge";
import type { ProfileSnapshot } from "@/lib/team-profile";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";
import { RepublishProfileButton } from "@/components/admin/republish-profile-button";
import { UnpublishProfileButton } from "@/components/admin/unpublish-profile-button";
import { RequestUpdateForm } from "@/components/admin/request-update-form";
import { FeaturedToggleButton } from "@/components/admin/featured-toggle-button";
import { SetAdminRoleButton } from "@/components/admin/set-admin-role-button";
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
    include: { user: { select: { id: true, email: true, status: true, role: true } } },
  });
  if (!profile) notFound();

  const adminCount = profile.user.role === "admin" ? await prisma.user.count({ where: { role: "admin" } }) : 0;

  // Was public at some point (a real publishedVersion snapshot exists)
  // but isn't now — the only way that happens is toggleUserStatusAction
  // unpublishing on deactivation (approving a pending edit while
  // deactivated deliberately leaves it false too, see that action's
  // comment), so this is specifically "hidden pending a fresh republish
  // decision," not "never published yet."
  const wasUnpublished = !profile.hasBeenPublished && profile.publishedVersion !== null;
  const canRepublish = wasUnpublished && profile.user.status === "active";

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
                {wasUnpublished && <StatusBadge label="unpublished" tone="warning" />}
                {profile.featuredOnHomepage && <StatusBadge label="featured on homepage" tone="positive" />}
                {profile.user.role === "admin" && <StatusBadge label="admin" tone="positive" />}
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
            {profile.hasBeenPublished && <UnpublishProfileButton profileId={profile.id} />}
            {canRepublish && <RepublishProfileButton profileId={profile.id} />}
          </div>
        </div>

        {wasUnpublished && (
          <div className="mt-6 border-t border-[rgba(255,255,255,0.08)] pt-4">
            <p className="text-sm text-ink-dim">
              {canRepublish
                ? "This profile is off the public site — either unpublished directly or pulled off automatically when the account was deactivated. It won't come back on its own — use Republish above once you've confirmed their info is still current."
                : "This profile is off the public site, and the account is deactivated. Reactivate the account first, then republish."}
            </p>
          </div>
        )}

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

        {profile.status !== "pending" && (
          <div className="mt-6 border-t border-[rgba(255,255,255,0.08)] pt-4">
            <p className="mb-1 font-mono text-[11px] tracking-wide text-ink-dim uppercase">Nudge</p>
            <p className="mb-3 text-sm text-ink-dim">
              Ask them to update something — a missing bio, a stale photo — without waiting for them to submit an
              edit first. Sends the same email and dashboard note as rejecting a submission.
            </p>
            <RequestUpdateForm profileId={profile.id} />
          </div>
        )}
      </AdminPanel>

      <AdminPanel>
        <p className="mb-1 font-mono text-[11px] tracking-wide text-ink-dim uppercase">Homepage</p>
        <p className="mb-3 text-sm text-ink-dim">
          {profile.featuredOnHomepage
            ? "Currently one of the curated members shown in the homepage team teaser."
            : "Not currently shown on the homepage teaser — that section pulls from whoever's featured here, capped at 5."}
        </p>
        <FeaturedToggleButton profileId={profile.id} featured={profile.featuredOnHomepage} />
      </AdminPanel>

      {/* Its own panel — a role change deserves the same seriousness as
          delete (confirmed via typing the name), so it gets the same
          separation from the casual toggles above. */}
      <AdminPanel className={profile.user.role === "admin" ? "border-red-500/20" : undefined}>
        <p className="mb-1 font-mono text-[11px] tracking-wide text-ink-dim uppercase">Admin access</p>
        <p className="mb-4 text-sm text-ink-dim">
          {profile.user.role === "admin"
            ? "Full access to /admin — every member's data, invites, and site content."
            : "Currently a regular team member — no access to /admin."}
        </p>
        {profile.user.role === "admin" ? (
          adminCount <= 1 ? (
            <p className="text-sm text-ink-dim/70 italic">
              The only admin left — promote someone else before this account can be demoted.
            </p>
          ) : (
            <SetAdminRoleButton mode="demote" userId={profile.user.id} name={profile.name} />
          )
        ) : (
          <SetAdminRoleButton mode="promote" userId={profile.user.id} name={profile.name} />
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
