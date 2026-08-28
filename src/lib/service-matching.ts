import type { Service } from "@prisma/client";

// Split out of services.ts — that file also imports prisma (for
// getAllServices/getServiceBySlug), which is fine for every server-only
// call site but broke team-teaser-grid.tsx (a "use client" component):
// importing anything from a module also pulls in that module's own
// imports, including prisma's side-effecting client instantiation,
// which Next.js then tries (and fails) to bundle @prisma/adapter-pg's
// `pg` driver for the browser. This file has zero DB code — pure
// matching logic only, safe to import from either side. services.ts
// re-exports everything here too, so existing server-side imports
// don't need to change.

// "Services they cover" on a team profile (SPEC.md Section 6) is meant to
// be derived from skill overlap, but skills are free-text — there's no
// shared taxonomy to join against. This is a small curated keyword map
// standing in for that until skills become structured data; a real
// tagging system would replace it outright, not extend it. Kept as static
// code (not a DB field) deliberately — it's matching *logic*, not content
// an admin would ever want to edit through the CRUD form.
const SERVICE_SKILL_KEYWORDS: Record<string, string[]> = {
  "web3-development": ["solidity", "rust", "smart contract", "dapp", "blockchain", "web3", "node.js", "postgres", "backend"],
  marketing: ["strategy", "campaign", "marketing", "positioning", "growth"],
  "social-media-management": ["content", "scheduling", "social"],
  "community-building": ["moderation", "discord", "community", "partnerships", "ops"],
};

export function servicesForSkills<T extends Pick<Service, "slug">>(skills: string[], allServices: T[]): T[] {
  const lowerSkills = skills.map((s) => s.toLowerCase());
  return allServices.filter((service) => {
    const keywords = SERVICE_SKILL_KEYWORDS[service.slug] ?? [];
    return lowerSkills.some((skill) => keywords.some((kw) => skill.includes(kw) || kw.includes(skill)));
  });
}

/**
 * Inverse of servicesForSkills — given a service, which published team
 * members would you actually work with on it. Same keyword map, just
 * checked in the other direction (team-profile.ts's "services covered"
 * section does the skills→services lookup; /services/[slug] needs
 * service→team-members, and now so does the homepage teaser's filter).
 */
export function teamMembersForService<T extends { skills: string[] }>(serviceSlug: string, members: T[]): T[] {
  const keywords = SERVICE_SKILL_KEYWORDS[serviceSlug] ?? [];
  if (keywords.length === 0) return [];
  return members.filter((member) => {
    const lowerSkills = member.skills.map((s) => s.toLowerCase());
    return lowerSkills.some((skill) => keywords.some((kw) => skill.includes(kw) || kw.includes(skill)));
  });
}

/**
 * Project.tags is free text (admin types anything, comma-separated — see
 * project-form.tsx), not a foreign key to a real Service row, so this is a
 * loose match: does this tag's slugified form match a service's slug, or
 * does it equal the service's title (case-insensitive)? Tags that don't
 * match anything just render as plain, unlinked tags on the project page
 * rather than guessing. Takes the already-fetched service list rather
 * than querying itself — callers (e.g. the project detail page, matching
 * a tag per item in a loop) fetch once and reuse it.
 */
export function serviceForTag<T extends Pick<Service, "slug" | "title">>(
  tag: string,
  allServices: T[],
): T | undefined {
  const normalized = tag.trim().toLowerCase();
  const slugified = normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return allServices.find((s) => s.slug === slugified || s.title.toLowerCase() === normalized);
}

/**
 * Reverse of the above — projects whose tags match this service, for the
 * service detail page's "related past projects." Same loose matching.
 */
export function projectsForService<T extends { tags: string[] }>(
  service: Pick<Service, "slug">,
  projects: T[],
  allServices: Pick<Service, "slug" | "title">[],
): T[] {
  return projects.filter((project) => project.tags.some((tag) => serviceForTag(tag, allServices)?.slug === service.slug));
}
