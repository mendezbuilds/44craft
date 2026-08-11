"use client";

import { AnimatePresence, motion } from "framer-motion";

type Size = "small" | "big";

const CONFIG: Record<Size, { count: number; spread: [number, number]; particle: string; duration: number }> = {
  // The contained echo used on admin's approve button — a handful of
  // embers radiating a short distance, small and quick.
  small: { count: 10, spread: [28, 44], particle: "h-1.5 w-1.5", duration: 0.55 },
  // The real thing — team teaser's skill-filter shatter. More particles,
  // further travel, matches "current cards shatter into small
  // gradient-colored embers" (SPEC.md Section 2) rather than a token
  // gesture.
  big: { count: 16, spread: [50, 90], particle: "h-2 w-2", duration: 0.7 },
};

function buildParticles(size: Size) {
  const { count, spread } = CONFIG[size];
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const distance = spread[0] + (i % 3) * ((spread[1] - spread[0]) / 2);
    return { dx: Math.cos(angle) * distance, dy: Math.sin(angle) * distance };
  });
}

/**
 * The site's spark-burst language, one component in two sizes rather than
 * two separate implementations — "small" is the contained echo already
 * shipped on admin's approve button, "big" is the real full-scale version
 * (team teaser's skill-filter shatter/reform, see team-teaser.tsx). Same
 * particle mechanics either way, just more of them and further travel.
 * Absolutely positioned over its trigger; render it as a sibling with
 * `position: relative` on the parent.
 */
export function GoldBurst({ active, size = "small" }: { active: boolean; size?: Size }) {
  const { particle, duration } = CONFIG[size];
  const particles = buildParticles(size);

  return (
    <AnimatePresence>
      {active && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          {particles.map((p, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{ opacity: 0, x: p.dx, y: p.dy, scale: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration, ease: "easeOut", delay: (i % 3) * 0.02 }}
              className={`absolute rounded-full ${particle}`}
              style={{ backgroundImage: "var(--gradient-gold)" }}
            />
          ))}
        </span>
      )}
    </AnimatePresence>
  );
}
