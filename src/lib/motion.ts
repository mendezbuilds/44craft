import type { TargetAndTransition, Variants } from "framer-motion";

/**
 * Reduced-motion handling for both variants below happens globally via
 * <MotionConfig reducedMotion="user"> in the root layout, which strips
 * transform animations (translate/scale) for users with the OS-level
 * reduced-motion preference while still allowing the opacity fade — a
 * static-ish fallback rather than an abrupt skip, per SPEC.md Section 2.
 */

const EASE_OUT: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

/** Fade + translateY. Staggered text/element entry (eyebrow, headline, CTAs). */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT, delay },
  }),
};

/** Plain opacity fade. Staggered facet entry inside the hero gem. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.7, ease: "easeOut", delay },
  }),
};

/**
 * Scroll-triggered stagger pair for below-the-fold sections (About,
 * Services, Why-us, Team, Contact, Footer). Deliberately separate from
 * `riseIn` above: `riseIn`'s `visible` is a function keyed by a manual
 * `custom` delay (right for hero's hand-tuned timing), which would fight
 * `staggerContainer`'s own per-child delay injection if reused here.
 * `riseInItem` is a plain variant object with no delay of its own, so
 * stagger timing comes only from the parent.
 *
 * Usage: parent gets `variants={staggerContainer} initial="hidden"
 * whileInView="visible" viewport={{ once: true }}`; each child gets
 * `variants={riseInItem}` (no initial/animate needed — it inherits from
 * the parent's variant propagation).
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const riseInItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

/**
 * Continuous ambient loops — distinct from the entrance variants above and
 * meant to run on a separately-animated wrapper element, never the same
 * element as an entrance animation, so the two transforms don't fight (see
 * Hero's gem-float/gem-big split). Both respect reduced-motion via the same
 * <MotionConfig reducedMotion="user"> as everything else — no per-component
 * check needed.
 *
 * `transition.delay` here only offsets the *first* cycle (matching CSS
 * `animation-delay` on an `infinite` animation) — with all shards sharing
 * one duration, a one-time delay keeps them permanently phase-offset from
 * each other rather than drifting in sync.
 */
export const floatLoop = {
  y: [0, -16, 0],
  transition: { duration: 7, ease: "easeInOut", repeat: Infinity },
} satisfies TargetAndTransition;

export function driftLoop(delay: number = 0): TargetAndTransition {
  return {
    y: [0, -14, 0],
    rotate: [0, 6, 0],
    transition: { duration: 8, ease: "easeInOut", repeat: Infinity, delay },
  };
}
