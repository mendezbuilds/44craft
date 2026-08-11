"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { staggerContainer } from "@/lib/motion";

/**
 * Wraps a section's staggered children (see riseInItem in lib/motion.ts).
 * Two trigger modes:
 *
 * - Default: `whileInView` + `viewport={{ once: true }}` — fires as the
 *   section scrolls into view, for the public site's long scroll-driven
 *   marketing pages. Hero deliberately doesn't use this — it needs to
 *   animate on load, not on scroll, since it's already in view.
 * - `onMount`: `initial`/`animate` — fires deterministically right on
 *   mount, no IntersectionObserver involved at all. Admin pages use this:
 *   their content is a data view (tables, cards), not a scroll narrative,
 *   so "scroll into view" was never the right trigger to begin with — and
 *   it produced a real bug (reported: action buttons/columns stuck
 *   invisible on /admin/invites and elsewhere), most likely from
 *   viewport-intersection timing being layout-dependent in ways scroll
 *   reveal has no reason to accept for content meant to be visible
 *   immediately. `onMount` sidesteps that whole class of risk rather than
 *   chasing the exact trigger condition — same deterministic pattern
 *   Hero already relies on.
 */
export function Reveal({
  className,
  children,
  amount = 0.2,
  onMount = false,
  ...props
}: HTMLMotionProps<"div"> & { amount?: number; onMount?: boolean }) {
  const trigger = onMount
    ? { initial: "hidden", animate: "visible" }
    : { initial: "hidden", whileInView: "visible", viewport: { once: true, amount } };

  return (
    <motion.div variants={staggerContainer} className={className} {...props} {...trigger}>
      {children}
    </motion.div>
  );
}
