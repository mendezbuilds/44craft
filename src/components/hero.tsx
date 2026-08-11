"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DiamondMark } from "@/components/icons/diamond-mark";
import { FloatingMark } from "@/components/motion/floating-mark";
import { riseIn, driftLoop } from "@/lib/motion";

const SHARDS = [
  { style: { left: "8%", top: "22%", width: 22 }, delay: 0.5 },
  { style: { right: "28%", top: "14%", width: 16 }, delay: 2 },
  { style: { right: "6%", top: "10%", width: 26 }, delay: 3.4 },
];

/**
 * Hero centerpiece — the real brand mark (public/brand/logo-mark.png), a
 * plain fade/rotate/scale entrance plus continuous float. A brief attempt
 * to precede this with a per-facet abstract diamond assembly (matching
 * SPEC.md's literal "the faceted diamond assembles" line) was reverted on
 * request — even transiently, an invented diamond shape on the hero
 * contradicts the separate, deliberate gold correction ("no longer an
 * invented abstract diamond... the actual logo artwork"). This is the
 * real mark from first paint, nothing else.
 */
function HeroGem() {
  return (
    <div className="pointer-events-none absolute -right-[0.5%] -bottom-[4%] z-[1] w-[min(42vw,620px)] max-[900px]:-right-[2%] max-[900px]:-bottom-[3%] max-[900px]:w-[62vw] max-[900px]:opacity-50">
      <FloatingMark />
    </div>
  );
}

export function Hero() {
  return (
    <div className="relative min-h-[88vh] overflow-hidden max-[900px]:min-h-[82vh]">
      {/* Shared gradient def for the shard fragments below — no visible
          content of its own, just a defs host (0x0 renders nothing). */}
      <svg width={0} height={0} aria-hidden="true">
        <defs>
          <linearGradient id="hero-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A6D1D" />
            <stop offset="55%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#F5E1A4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Large outline-only "44" watermark bleeding off the left edge —
          background layer, sits behind everything. Hidden below 900px per
          the mockup (no room for it once the layout tightens up). */}
      <div
        aria-hidden="true"
        className="hero-watermark pointer-events-none absolute top-[46%] left-[-4%] z-0 -translate-y-1/2 leading-none font-display font-extrabold select-none max-[900px]:hidden"
      >
        44
      </div>

      <HeroGem />

      {SHARDS.map((shard) => (
        <motion.svg
          key={shard.style.width}
          className="pointer-events-none absolute z-[1] opacity-30"
          style={shard.style}
          viewBox="0 0 40 40"
          animate={driftLoop(shard.delay)}
          aria-hidden="true"
        >
          <polygon points="20,2 38,36 2,36" fill="url(#hero-gold)" />
        </motion.svg>
      ))}

      <div className="relative z-[3] mx-auto flex min-h-[88vh] max-w-[1400px] flex-col justify-center px-6 max-[900px]:min-h-[82vh] min-[901px]:px-12">
        <motion.div
          variants={riseIn}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="mb-[22px] flex items-center gap-[10px] font-mono text-xs uppercase tracking-[3px] text-ink-dim"
        >
          <DiamondMark size={6} glow={false} />
          4 rules — 4 outcome
        </motion.div>

        <motion.h1
          variants={riseIn}
          initial="hidden"
          animate="visible"
          custom={0.22}
          className="mb-7 max-w-[900px] text-[clamp(48px,7vw,96px)] leading-[0.98] font-display font-extrabold tracking-[-1.5px] text-ink max-[900px]:text-[clamp(36px,11vw,56px)]"
        >
          Craftsmen figuring it out{" "}
          <span className="text-ink-dim">with no handouts.</span>
        </motion.h1>

        <motion.p
          variants={riseIn}
          initial="hidden"
          animate="visible"
          custom={0.34}
          className="mb-[38px] max-w-[420px] text-[17px] leading-[1.6] text-ink-dim"
        >
          44Craft partners with real projects, ships real infrastructure,
          and grows a community that shows up — not just talks about it.
        </motion.p>

        <motion.div
          variants={riseIn}
          initial="hidden"
          animate="visible"
          custom={0.46}
          className="flex flex-wrap gap-[14px]"
        >
          <Button href="/#contact" variant="primary">
            Start a project
          </Button>
          <Button href="/projects" variant="ghost">
            See our work
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
