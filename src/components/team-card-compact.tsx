import Link from "next/link";
import { initials } from "@/lib/initials";
import { TeamPhoto } from "@/components/team-photo";
import type { TeamCardMember } from "@/components/team-card";

/**
 * The mobile teaser carousel's slide (team-carousel.tsx) — image-dominant,
 * ~70/30 photo-to-info split, on request (was 80/20 initially). Not the
 * same component as team-card.tsx's grid card (that one also shows skill
 * tags, this one doesn't — glance/browse moment, tap through to the
 * profile for the rest), but shows the same name + role, and now the
 * same *lack* of socials too — the icon row here was a mobile-only
 * addition the desktop grid card never had; removed so the two actually
 * match instead of mobile showing more than desktop. Real clickable
 * social links still live on the profile page itself.
 *
 * Sizing follows the lesson from team-card.tsx's own history this
 * session (see its comment) rather than repeating the mistake: the image
 * gets its own fixed aspect ratio, independent of the info strip below it
 * — no flex-1/competing-for-leftover-space setup.
 */
export function TeamCardCompact({ member }: { member: TeamCardMember }) {
  return (
    <Link
      href={`/team/${member.slug}`}
      className="team-card-glow group flex w-full flex-col overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] transition-[border-color] duration-300 hover:border-[rgba(212,175,55,0.5)]"
    >
      {/* ~70% of the card — own aspect ratio, not flex-1 (see note above).
          4:3 was originally picked as a "recognizable photo crop" ratio
          for a plain object-cover fill — solving purely from the info
          strip's ~49px measured height landed on 14:5 (2.8:1), which
          turned a portrait headshot into a sliver showing hair and
          nothing else. TeamPhoto (blurred backdrop + contain) means this
          box no longer crops the photo at all regardless of its ratio,
          but 4:3 is still a fine frame shape to keep. */}
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-gradient-to-br from-[#1a170f] to-[#0a0a08]">
        {member.photo ? (
          <TeamPhoto src={member.photo} sizes="100vw" hoverZoom />
        ) : (
          <span
            aria-hidden="true"
            className="team-card-initials pointer-events-none absolute inset-0 flex select-none items-center justify-center font-display font-extrabold transition-transform duration-500 group-hover:scale-105"
          >
            {initials(member.name)}
          </span>
        )}
      </div>

      {/* ~30% — name + role, matching the desktop grid card's info
          panel content exactly now (no socials, no skill tags). Both
          forced to one line (truncate) for consistent card height. */}
      <div className="flex flex-col gap-1.5 border-t border-[rgba(255,255,255,0.08)] bg-[#141310] px-4 py-5">
        <h3 className="min-w-0 truncate font-display text-base font-bold text-ink">{member.name}</h3>
        <p className="min-w-0 truncate text-sm text-ink-dim">{member.roleTitle}</p>
      </div>
    </Link>
  );
}
