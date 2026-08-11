import Link from "next/link";
import { Section } from "@/components/ui/section";
import { DiamondMark } from "@/components/icons/diamond-mark";
import { TeamTeaserGrid } from "@/components/team-teaser-grid";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { getPublishedTeamProfiles } from "@/lib/team-profile";

/**
 * Real published team_profiles as of Phase 5 (was static mock data through
 * Phase 3). The interactive skill-filter/spark-burst version deferred back
 * then (SPEC.md's early homepage notes) is now built for real — see
 * team-teaser-grid.tsx, the client component this delegates to once data
 * is fetched.
 *
 * No featuring mechanism exists yet — the default (unfiltered) view shows
 * the first 8 published profiles, same count the static version used;
 * filtering searches the full published set, not just those 8.
 *
 * Section header/copy always renders, even with zero published profiles —
 * only the grid underneath gets an empty state (matching /team's own
 * "no published profiles yet" tone). An early-return-to-null here used to
 * make the whole section vanish, heading included, whenever the team
 * roster was empty.
 */
export async function TeamTeaser() {
  const profiles = await getPublishedTeamProfiles();
  const members = profiles.map((profile) => ({
    slug: profile.slug,
    name: profile.name,
    roleTitle: profile.roleTitle,
    photo: profile.photo,
    skills: profile.skills,
  }));
  const featured = members.slice(0, 8);

  return (
    <Section id="team" className="py-24 min-[901px]:py-32">
      <Reveal>
        <RevealItem className="mb-5 flex items-center gap-[10px] font-mono text-xs uppercase tracking-[3px] text-ink-dim">
          <DiamondMark size={6} glow={false} />
          The team
        </RevealItem>

        <RevealItem className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-[560px] font-display text-[clamp(28px,4vw,40px)] font-bold leading-[1.15] tracking-[-1px] text-ink">
            Craftsmen figuring it out, together.
          </h2>
          <Link
            href="/team"
            className="group relative flex items-center gap-2 text-sm font-medium text-ink-dim transition-colors hover:text-[#d4af37]"
          >
            <span>Meet the full team</span>
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </RevealItem>

        {members.length > 0 ? (
          <RevealItem>
            <TeamTeaserGrid profiles={members} initialFeatured={featured} />
          </RevealItem>
        ) : (
          <RevealItem>
            <p className="text-sm text-ink-dim">Team profiles coming soon.</p>
          </RevealItem>
        )}
      </Reveal>
    </Section>
  );
}
