import Link from "next/link";
import { initials } from "@/lib/initials";
import { SOCIAL_ICONS } from "@/components/icons/social-icons";
import { TeamPhoto } from "@/components/team-photo";
import type { TeamCardMember } from "@/components/team-card";
import type { Socials } from "@/lib/team-profile";

const SOCIAL_ORDER: (keyof Socials)[] = ["github", "linkedin", "x", "website"];

/**
 * The mobile teaser carousel's slide (team-carousel.tsx) — image-dominant,
 * ~70/30 photo-to-info split, on request (was 80/20 initially). Deliberately not the same
 * component as team-card.tsx's grid card: that one shows role + full skill
 * tags, this one shows just name + social icons, on the reasoning that a
 * single full-width swipeable slide is a glance/browse moment (tap through
 * to the profile for the rest), not the place to repeat everything.
 *
 * Sizing follows the lesson from team-card.tsx's own history this
 * session (see its comment) rather than repeating the mistake: the image
 * gets its own fixed aspect ratio, independent of the info strip below it
 * — no flex-1/competing-for-leftover-space setup. The info strip's height
 * is small and *bounded* by construction (name forced to one line via
 * truncate, icon row is a fixed-size row that reserves its height even
 * with zero socials) rather than open-ended wrapping text, so unlike the
 * grid card there's no real risk of it needing more room than a fixed
 * ratio allows — still, it's the info strip's own natural height that
 * determines the split, not a forced total.
 *
 * The whole slide is one <Link> to the profile — individual social icons
 * are shown as glanceable indicators, not separately clickable, since
 * nesting real links inside the card's own link isn't valid HTML. Real
 * clickable social links already exist on the profile page itself.
 */
export function TeamCardCompact({ member }: { member: TeamCardMember }) {
  const socials = member.socials ?? {};
  const activeSocials = SOCIAL_ORDER.filter((key) => socials[key]);

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
          but 4:3 is still a fine frame shape to keep — the strip below
          grew (single row → stacked two rows) to make up the rest of the
          ~70/30 split instead. */}
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

      {/* ~30% — name and the icon row stacked (not side-by-side) so the
          strip has enough natural height for the split without empty
          padding standing in for content. Name still forced to one line
          (truncate); icon row is a fixed height so it holds its place
          even with zero socials. */}
      <div className="flex flex-col gap-2 border-t border-[rgba(255,255,255,0.08)] bg-[#141310] px-4 py-5">
        <h3 className="min-w-0 truncate font-display text-base font-bold text-ink">{member.name}</h3>
        <div className="flex h-5 shrink-0 items-center gap-2.5 text-ink-dim">
          {activeSocials.map((key) => {
            const Icon = SOCIAL_ICONS[key];
            return <Icon key={key} className="h-4 w-4" />;
          })}
        </div>
      </div>
    </Link>
  );
}
