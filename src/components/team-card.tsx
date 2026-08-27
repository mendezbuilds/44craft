"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Tag } from "@/components/ui/tag";
import { TeamPhoto } from "@/components/team-photo";
import { initials } from "@/lib/initials";
import type { Socials } from "@/lib/team-profile";

export type TeamCardMember = {
  slug: string;
  name: string;
  roleTitle: string;
  photo: string | null;
  skills: string[];
  // Optional — only team-card-compact.tsx (the mobile teaser carousel)
  // actually renders these; the desktop grid card doesn't show socials at
  // all, so most call sites can leave this off.
  socials?: Socials;
};

const MAX_TILT = 8; // degrees

/**
 * Single-face card — the earlier flip interaction was removed on request
 * (felt like unnecessary friction to see a name/role). The whole card is
 * a plain link to /team/[slug] (real page as of Phase 5), with a
 * persistent breathing gold glow border (.team-card-glow, globals.css)
 * that intensifies on hover.
 *
 * Image and info are two separate stacked zones, not an overlay — an
 * earlier version put name/role/skills on a scrim over the bottom of the
 * photo area, which covered part of it. Info now lives in its own solid
 * panel below the image instead. Falls back to large initials (same
 * treatment as before) when a member has no photo yet.
 *
 * Cursor-reactive 3D tilt (SPEC.md Section 2/6, "client" component now
 * because of it) — pointer position within the card drives rotateX/
 * rotateY through a spring, perspective on the outer wrapper. Explicitly
 * skipped under prefers-reduced-motion: <MotionConfig reducedMotion="user">
 * in the root layout only patches Framer's own animate/variants system,
 * not raw motion-value writes from a pointer handler, so this checks
 * matchMedia itself rather than relying on that.
 *
 * Sizing (rewritten after two rounds of a wrong diagnosis — see git
 * history if curious, but the short version: it was never a percentage-
 * height/CSS-cascade bug at all). The card used to fix its *total* height
 * via `aspect-[3/4]` on the outer box, with the image area as a
 * `flex-1` child competing against the info panel (name/role/skills
 * text) for whatever space was left. Confirmed via real DOM measurement
 * against the live site: on a narrow 2-column mobile grid, the info
 * panel's wrapped text alone needs *more* height than the entire
 * aspect-locked card — so the flex-1 image area got squeezed to exactly
 * 0, while the overflowing text got silently clipped by the card's own
 * `overflow-hidden`. Fine on wide desktop columns (more width per card,
 * less text wrapping), broken on mobile.
 *
 * Fix: the image area gets its *own* fixed aspect ratio (`aspect-square`)
 * instead of stretching to fill leftover space, so its size no longer
 * depends on how much text is below it. The card's total height is just
 * "image's own height + however tall the text needs to be" — no more
 * competition, nothing to squeeze to zero. No fixed height anywhere on
 * the outer wrappers either now; they're auto/content-sized. The team
 * grids (team-teaser-grid.tsx, /team/page.tsx) use `items-start` so CSS
 * Grid's default stretch-to-row-height behavior doesn't force
 * same-row cards to an artificial uniform height now that they're not
 * all identically aspect-locked.
 */
export function TeamCard({
  member,
  hideSkills = false,
}: {
  member: TeamCardMember;
  /** /team's own grid passes this — the homepage teaser (team-teaser-grid.tsx)
   * doesn't, since its skill chips are a filter control, not just a display
   * of the card's own tags, and are explicitly out of scope for this change. */
  hideSkills?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [MAX_TILT, -MAX_TILT]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-MAX_TILT, MAX_TILT]), { stiffness: 300, damping: 30 });

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handlePointerLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div ref={ref} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} style={{ perspective: 800 }}>
      <motion.div style={{ rotateX, rotateY }}>
        <Link
          href={`/team/${member.slug}`}
          className="team-card-glow group flex flex-col overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] transition-[border-color] duration-300 hover:border-[rgba(212,175,55,0.5)]"
        >
          {/* Image area — a real photo once uploaded, initials placeholder until then.
              aspect-square (not flex-1) — see the sizing note above. Blurred-
              backdrop + contain pattern (TeamPhoto) rather than a plain
              object-cover crop — see that component's own comment for why. */}
          <div className="relative aspect-square shrink-0 overflow-hidden bg-gradient-to-br from-[#1a170f] to-[#0a0a08]">
            {member.photo ? (
              <TeamPhoto
                src={member.photo}
                sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
                hoverZoom
              />
            ) : (
              <span
                aria-hidden="true"
                className="team-card-initials pointer-events-none absolute inset-0 flex select-none items-center justify-center font-display font-extrabold transition-transform duration-500 group-hover:scale-105"
              >
                {initials(member.name)}
              </span>
            )}
          </div>

          {/* Info area — separate panel, doesn't sit over the image. Name/
              role truncate to one line each on /team's grid (hideSkills
              callers only — see that prop's own comment) so every card's
              info panel is the same fixed height regardless of content
              length, rather than fighting the grid's `items-start` (kept
              deliberately non-stretching for the image-squeeze bug it
              fixed — see the sizing note above) with per-card height
              variance from wrapping text. */}
          <div className="border-t border-[rgba(255,255,255,0.08)] bg-[#141310] px-4 py-4">
            <h3 className={hideSkills ? "truncate font-display text-base font-bold text-ink" : "font-display text-base font-bold text-ink"}>
              {member.name}
            </h3>
            <p className={hideSkills ? "truncate text-sm text-ink-dim" : "mb-3 text-sm text-ink-dim"}>{member.roleTitle}</p>
            {!hideSkills && (
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
