"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { riseInItem } from "@/lib/motion";

/**
 * Closing banner between Contact and Footer — a punchier one-line
 * statement + single CTA, distinct from the Contact form above it (which
 * is the actual conversion point). Scrolls to the same #contact form
 * rather than duplicating it as a second form.
 */
export function FinalCta() {
  return (
    <Section className="py-24 min-[901px]:py-32">
      <Reveal className="relative overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.25)] bg-gradient-to-br from-[#141310] to-[#0a0a08] px-8 py-16 text-center min-[901px]:px-16 min-[901px]:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.14)_0%,transparent_60%)]"
        />

        <div className="relative mx-auto max-w-[640px]">
          <motion.h2
            variants={riseInItem}
            className="mb-5 font-display text-[clamp(28px,4.5vw,44px)] leading-[1.1] font-bold tracking-[-1px] text-ink"
          >
            Ready to build something real?
          </motion.h2>

          <RevealItem className="mb-10 text-[17px] leading-[1.6] text-ink-dim">
            No decks, no fluff — just craftsmen ready to ship.
          </RevealItem>

          <RevealItem>
            <Button href="/#contact" variant="primary">
              Start a project →
            </Button>
          </RevealItem>
        </div>
      </Reveal>
    </Section>
  );
}
