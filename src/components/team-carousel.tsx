"use client";

import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { TeamCardCompact } from "@/components/team-card-compact";
import type { TeamCardMember } from "@/components/team-card";
import { cn } from "@/lib/cn";

const SWIPE_OFFSET_THRESHOLD = 50; // px
const SWIPE_VELOCITY_THRESHOLD = 400; // px/s — a fast flick counts even under the offset threshold

/**
 * Mobile-only replacement for the card grid below the ~601px breakpoint
 * (team-teaser-grid.tsx renders this and the grid side by side with
 * responsive hidden/block classes — same SSR-safe dual-render pattern as
 * the admin table/card views elsewhere in this codebase, not a JS media
 * query). One full-width TeamCardCompact slide at a time, swipe/drag to
 * move between members instead of scrolling a multi-column grid.
 *
 * One active slide, swapped via AnimatePresence — not a wide flex track
 * of every slide positioned via a shared x offset. That first version
 * looked reasonable but was actually broken: `drag` and an `animate`
 * prop both trying to own the same `x` fought each other, so clicking a
 * pagination dot updated the dot correctly but the track silently never
 * moved (only caught by testing an actual multi-slide swap — with the
 * one real profile in the dev DB at the time, this was invisible).
 * Here, `key={member.slug}` on the single rendered slide is what
 * actually changes — AnimatePresence handles animating the old one out
 * and the new one in, and the currently-mounted slide's own `drag`
 * (with dragConstraints locked to 0 and dragElastic for rubber-band
 * resistance) handles its own snap-back-if-you-didn't-swipe-far-enough
 * case using Framer's built-in behavior, not anything hand-rolled.
 */
export function TeamCarousel({ members }: { members: TeamCardMember[] }) {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);
  const clampedIndex = Math.min(index, Math.max(members.length - 1, 0));

  function goTo(next: number, dir: number) {
    const clamped = Math.max(0, Math.min(members.length - 1, next));
    if (clamped === clampedIndex) return;
    setSlide([clamped, dir]);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info;
    if (offset.x < -SWIPE_OFFSET_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
      goTo(clampedIndex + 1, 1);
    } else if (offset.x > SWIPE_OFFSET_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD) {
      goTo(clampedIndex - 1, -1);
    }
    // Otherwise: didn't cross the threshold — no goTo() call, so this
    // slide's own key doesn't change, and Framer's drag+dragConstraints
    // springs it back to 0 on its own.
  }

  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const member = members[clampedIndex];
  if (!member) return null;

  return (
    <div>
      <div className="relative overflow-hidden">
        {/* mode="popLayout" — without it, the outgoing and incoming slides
            briefly coexist in normal document flow during the crossfade
            (AnimatePresence's default), stacking vertically for that
            instant and shifting the container's height. That read as a
            two-step glitch: a visible vertical nudge as the old slide's
            box affected layout, *then* the horizontal swipe settling —
            not a drag/scroll axis conflict, a layout one. popLayout pulls
            the exiting slide out of flow (position: absolute) the moment
            it starts leaving, so it can't push the incoming one around. */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={member.slug}
            initial={reducedMotion ? false : { x: direction === 0 ? 0 : direction > 0 ? "100%" : "-100%", opacity: direction === 0 ? 1 : 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { x: direction > 0 ? "-100%" : "100%", opacity: 0 }}
            transition={reducedMotion ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 32 }}
            drag={members.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            className="px-1"
          >
            <TeamCardCompact member={member} />
          </motion.div>
        </AnimatePresence>
      </div>

      {members.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {members.map((m, i) => (
            <button
              key={m.slug}
              type="button"
              aria-label={`Show ${m.name}`}
              onClick={() => goTo(i, i > clampedIndex ? 1 : -1)}
              className={cn(
                "h-1.5 rounded-full transition-[width,background-color] duration-200",
                i === clampedIndex ? "w-6 bg-gold" : "w-1.5 bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.35)]",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
