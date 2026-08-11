"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Section } from "@/components/ui/section";
import { DiamondMark } from "@/components/icons/diamond-mark";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { riseInItem, floatLoop } from "@/lib/motion";

export function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax for the watermark
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <Section id="about" className="relative overflow-hidden py-24 min-[901px]:py-32">
      {/* Local defs for the shard gradient */}
      <svg width={0} height={0} aria-hidden="true">
        <defs>
          <linearGradient id="about-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A6D1D" />
            <stop offset="55%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#F5E1A4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Massive watermark bleeding off the edge */}
      <motion.div
        style={{ y, WebkitTextStroke: "1px rgba(255, 255, 255, 0.05)" }}
        className="pointer-events-none absolute -left-[5%] top-0 z-0 select-none font-display text-[clamp(180px,25vw,360px)] font-extrabold leading-none text-transparent opacity-30 max-[900px]:hidden"
        aria-hidden="true"
      >
        01
      </motion.div>

      {/* Abstract geometric gold shard floating on the right */}
      <motion.svg
        className="pointer-events-none absolute right-[10%] top-[20%] z-0 w-[40px] opacity-20 max-[900px]:hidden"
        viewBox="0 0 40 40"
        animate={floatLoop}
        aria-hidden="true"
      >
        <polygon points="20,2 38,36 2,36" fill="url(#about-gold)" />
      </motion.svg>

      <div ref={containerRef} className="relative z-10 mx-auto w-full">
        <Reveal>
          <div className="grid gap-12 min-[901px]:grid-cols-12 min-[901px]:gap-8">
            {/* Left side: Sticky typography */}
            <div className="min-[901px]:col-span-5 min-[901px]:col-start-1">
              <div className="sticky top-32">
                <RevealItem className="mb-6 flex items-center gap-[10px] font-mono text-xs uppercase tracking-[3px] text-ink-dim">
                  <DiamondMark size={6} glow={false} />
                  About Us
                </RevealItem>
                <motion.h2
                  variants={riseInItem}
                  className="max-w-[500px] font-display text-[clamp(40px,5.5vw,72px)] font-bold leading-[1.05] tracking-[-1.5px] text-ink"
                >
                  Infrastructure, <br className="hidden min-[901px]:block" />
                  not narratives.
                </motion.h2>
              </div>
            </div>

            {/* Right side: Asymmetric staggered text */}
            <div className="min-[901px]:col-span-6 min-[901px]:col-start-7 min-[901px]:mt-32">
              <RevealItem className="mb-12 max-w-[520px]">
                <p className="text-[19px] leading-[1.7] text-ink-dim">
                  44Craft is two things at once: a craft-driven agency delivering
                  real client work — web3, marketing, social media management, and
                  more — and a growing community for self-made builders. Craftsmen
                  figuring it out with no handouts.
                </p>
              </RevealItem>

              <RevealItem className="ml-0 max-w-[520px] min-[901px]:ml-16">
                <div className="mb-8 h-[1px] w-12 bg-gradient-to-r from-[#d4af37] to-transparent opacity-40" />
                <p className="text-[19px] leading-[1.7] text-ink-dim">
                  We&apos;re building toward a large African tech community —
                  welcoming people from web2 into web3, a place to explore, grind,
                  and win together. Aligned for the long term, not a short-term
                  collaboration.
                </p>
              </RevealItem>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
