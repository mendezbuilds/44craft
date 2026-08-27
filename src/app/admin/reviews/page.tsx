import { prisma } from "@/lib/prisma";
import { AdminPanel } from "@/components/admin/admin-panel";
import { ProfileDiff } from "@/components/admin/profile-diff";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import type { ProfileSnapshot } from "@/lib/team-profile";
import { ApproveButton } from "./approve-button";
import { RejectForm } from "./reject-form";

/**
 * The main piece of Phase 6 — for each pending profile, a field-by-field
 * diff of publishedVersion vs pendingVersion (see ProfileDiff), replacing
 * the raw-dump table from Phase 5.
 */
export default async function AdminReviewsPage() {
  const pending = await prisma.teamProfile.findMany({
    where: { status: "pending" },
    orderBy: { updatedAt: "asc" },
  });

  return (
    <Reveal onMount className="flex flex-col gap-6">
      <RevealItem>
        <h1 className="font-display text-xl font-bold text-ink">Profile reviews</h1>
      </RevealItem>

      {pending.length === 0 ? (
        <RevealItem>
          <p className="text-sm text-ink-dim">Nothing pending.</p>
        </RevealItem>
      ) : (
        pending.map((profile) => {
          const before = profile.publishedVersion as ProfileSnapshot | null;
          const after = profile.pendingVersion as ProfileSnapshot;
          return (
            // id — the target of the "review this edit" admin-notification
            // email's CTA. This page lists every pending edit inline rather
            // than having a separate per-id route, so an anchor scroll is
            // this page's own equivalent of "straight to the specific one".
            <RevealItem key={profile.id} id={profile.id}>
              <AdminPanel>
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h2 className="font-display text-base font-semibold text-ink">{profile.name}</h2>
                    <p className="text-xs text-ink-dim">
                      Submitted {profile.updatedAt.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <ProfileDiff before={before} after={after} />

                <div className="mt-5 flex flex-wrap items-start justify-between gap-4 border-t border-[rgba(255,255,255,0.08)] pt-4">
                  <ApproveButton profileId={profile.id} />
                  <RejectForm profileId={profile.id} />
                </div>
              </AdminPanel>
            </RevealItem>
          );
        })
      )}
    </Reveal>
  );
}
