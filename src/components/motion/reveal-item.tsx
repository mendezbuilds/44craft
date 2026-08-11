"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { riseInItem } from "@/lib/motion";

/**
 * A single staggered child of <Reveal>. Deliberately has no
 * initial/animate/whileInView of its own — it inherits "hidden"/"visible"
 * from the nearest <Reveal> ancestor via Framer Motion's variant
 * propagation, which is what makes the stagger timing work.
 *
 * Always renders a <div>. Dynamically picking the tag via `motion[as]`
 * (bracket access into the `motion` proxy) looked convenient but crashes
 * SSR — `createMotionComponent` behind that dynamic lookup is client-only,
 * unlike the statically-imported `motion.div`/`motion.h2`/etc. Where real
 * tag semantics matter (headings, nav), use `motion.h2` etc. directly with
 * `variants={riseInItem}` instead of this component — see about.tsx,
 * footer.tsx.
 */
export function RevealItem({ className, children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={riseInItem} className={className} {...props}>
      {children}
    </motion.div>
  );
}
