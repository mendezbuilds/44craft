// No `import "server-only"` guard here (unlike lib/auth.ts) — this file is
// imported by scripts/setup-storage.ts, which runs via plain `tsx`
// outside Next's bundler and can't resolve that package. Safe without it:
// the only client-side reference (profile-editor.tsx) is `import type`,
// which is erased at compile time and never pulls in this module's
// runtime code.
import { prisma } from "@/lib/prisma";

export const TEAM_PHOTOS_BUCKET = "team-photos";

export type Socials = {
  github?: string;
  linkedin?: string;
  x?: string;
  website?: string;
};

/**
 * The editable content of a profile — what the guided editor collects and
 * what publishedVersion/pendingVersion snapshots hold. Deliberately
 * excludes featuredWork (the `projects` relation): that's admin-assigned
 * only, never part of what a member submits (SPEC.md Section 5).
 */
export type ProfileSnapshot = {
  name: string;
  roleTitle: string;
  photo: string | null;
  bio: string;
  skills: string[];
  socials: Socials;
};

export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "member";
}

/** Appends -2, -3, etc. until it finds a slug not already in use. */
export async function uniqueSlugFor(name: string, excludeProfileId?: string) {
  const base = slugify(name);
  let candidate = base;
  let n = 2;

  for (;;) {
    const existing = await prisma.teamProfile.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeProfileId) return candidate;
    candidate = `${base}-${n++}`;
  }
}

export function getMyTeamProfile(userId: string) {
  return prisma.teamProfile.findUnique({
    where: { userId },
    include: {
      activity: { orderBy: { createdAt: "desc" } },
      projects: true,
    },
  });
}

/**
 * The public-facing view of a profile — rendered from `publishedVersion`
 * (the last-approved snapshot), not the top-level columns. Those columns
 * are the member's current *working* copy and can already reflect an
 * unapproved edit sitting in `pendingVersion`; reading them here would leak
 * that edit onto the public site before an admin has seen it. `id`/`slug`
 * and the `projects` relation aren't part of the snapshot (slug is
 * generated separately, featured work is never self-submitted), so those
 * still come from the row itself.
 */
export type PublicProfile = ProfileSnapshot & {
  id: string;
  slug: string;
  userId: string;
  projects: { id: string; slug: string; title: string; coverImage: string | null }[];
};

function toPublicProfile(row: {
  id: string;
  slug: string;
  userId: string;
  publishedVersion: unknown;
  projects: { id: string; slug: string; title: string; coverImage: string | null }[];
}): PublicProfile {
  const snapshot = row.publishedVersion as ProfileSnapshot;
  return { ...snapshot, id: row.id, slug: row.slug, userId: row.userId, projects: row.projects };
}

/**
 * Every profile that's ever been published, ordered by name — the real
 * /team grid and the homepage teaser both read from this. Filtered on
 * `hasBeenPublished` (sticky) rather than the current `status`, so a
 * member mid-re-review still shows their last-approved content instead of
 * disappearing from the public site — see the field's comment in
 * schema.prisma.
 */
export async function getPublishedTeamProfiles(): Promise<PublicProfile[]> {
  const rows = await prisma.teamProfile.findMany({
    where: { hasBeenPublished: true },
    include: { projects: { select: { id: true, slug: true, title: true, coverImage: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map(toPublicProfile);
}

export async function getPublishedTeamProfileBySlug(slug: string): Promise<PublicProfile | null> {
  const row = await prisma.teamProfile.findFirst({
    where: { slug, hasBeenPublished: true },
    include: { projects: { select: { id: true, slug: true, title: true, coverImage: true } } },
  });
  return row ? toPublicProfile(row) : null;
}
