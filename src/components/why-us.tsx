"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { DiamondMark } from "@/components/icons/diamond-mark";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { riseInItem } from "@/lib/motion";

// Same icon four times reads mechanically repeated at 0° — a small,
// varied rotation per card keeps the row feeling hand-placed instead of
// stamped out. Subtle on purpose, not enough to look broken/misaligned.
const ICON_ROTATIONS = [0, 15, -10, 8];

const DIFFERENTIATORS = [
  {
    title: "We ship, not pitch",
    body: "Real delivered work, not polished decks promising it later.",
  },
  {
    title: "Direct access",
    body: "No account-manager layers between you and the people doing the work.",
  },
  {
    title: "Long-term by default",
    body: "Aligned for the long term, not a short-term collaboration.",
  },
  {
    title: "Community-backed",
    body: "Part of a growing builder community, not just a vendor relationship.",
  },
];

export function WhyUs() {
  return (
    <Section id="why-us" className="py-24 min-[901px]:py-32">
      <Reveal>
        <div className="grid gap-16 min-[901px]:grid-cols-12 min-[901px]:gap-8">
          
          {/* Sticky Left Column */}
          <div className="min-[901px]:col-span-5 min-[901px]:col-start-1">
            <div className="sticky top-32">
              <RevealItem className="mb-6 flex items-center gap-[10px] font-mono text-xs uppercase tracking-[3px] text-ink-dim">
                <DiamondMark size={6} glow={false} />
                Why work with us
              </RevealItem>
              <motion.h2
                variants={riseInItem}
                className="max-w-[480px] font-display text-[clamp(40px,5.5vw,64px)] font-bold leading-[1.05] tracking-[-1.5px] text-ink"
              >
                Built for <br className="hidden min-[901px]:block" />
                the long game.
              </motion.h2>
            </div>
          </div>

          {/* Scrolling Stack Right Column */}
          <div className="min-[901px]:col-span-6 min-[901px]:col-start-7">
            <div className="flex flex-col gap-12 min-[901px]:gap-24">
              {DIFFERENTIATORS.map((item, i) => (
                <RevealItem 
                  key={item.title}
                  className="sticky" 
                  style={{ top: `calc(8rem + ${i * 1.5}rem)` }}
                >
                  <Card hover className="bg-[#0a0a08] min-h-[300px] border-[#d4af37]/20 p-8 shadow-2xl min-[901px]:p-12">
                    <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8A6D1D]/20 to-transparent">
                      <Image
                        src="/icons/check-diamond.svg"
                        alt=""
                        width={32}
                        height={32}
                        style={{ transform: `rotate(${ICON_ROTATIONS[i]}deg)` }}
                      />
                    </div>
                    <h3 className="mb-4 font-display text-3xl font-bold text-ink">{item.title}</h3>
                    <p className="max-w-[400px] text-lg leading-relaxed text-ink-dim">{item.body}</p>
                  </Card>
                </RevealItem>
              ))}
            </div>
          </div>

        </div>
      </Reveal>
    </Section>
  );
}
