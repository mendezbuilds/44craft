"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { floatLoop } from "@/lib/motion";

const LOGO_MARK_WIDTH = 646;
const LOGO_MARK_HEIGHT = 520;
const EASE_OUT: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

/**
 * The real brand mark (public/brand/logo-mark.png) — two independently
 * animated layers: the outer wrapper carries the continuous float loop,
 * the inner one carries the one-time rotate/scale/fade entrance, kept
 * separate so the transforms compose instead of fighting (see
 * lib/motion.ts). `playEntrance={false}` skips straight to the settled
 * end-state (still floating), no transition.
 *
 * Deliberately no facet/diamond assembly. An earlier version of this
 * component assembled an abstract 8-facet gem first, then cross-faded
 * into this photo — a reconciliation attempt that, even as a transient
 * flash, put an invented diamond shape back on the hero after SPEC.md's
 * gold correction explicitly moved away from exactly that ("no longer an
 * invented abstract diamond... background-removed crops of the actual
 * logo artwork"). Reverted on request — this is the real mark, nothing
 * else, from first paint.
 */
export function FloatingMark({ playEntrance = true, size = "w-full" }: { playEntrance?: boolean; size?: string }) {
  return (
    <motion.div className={`relative aspect-[646/520] ${size}`} animate={floatLoop} aria-hidden="true">
      <motion.div
        initial={playEntrance ? { opacity: 0, rotate: 12, scale: 0.92 } : false}
        animate={{ opacity: 1, rotate: 12, scale: 1 }}
        transition={playEntrance ? { duration: 1, ease: EASE_OUT, delay: 0.15 } : undefined}
      >
        <Image
          src="/brand/logo-mark.png"
          alt=""
          width={LOGO_MARK_WIDTH}
          height={LOGO_MARK_HEIGHT}
          className="h-full w-full object-contain"
          priority
        />
      </motion.div>
    </motion.div>
  );
}
