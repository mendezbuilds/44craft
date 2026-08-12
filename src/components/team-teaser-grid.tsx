"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TeamCard, type TeamCardMember } from "@/components/team-card";
import { TeamCarousel } from "@/components/team-carousel";
import { GoldBurst } from "@/components/motion/gold-burst";
import { cn } from "@/lib/cn";

const MAX_CHIPS = 8;
const MAX_VISIBLE = 8;
// How long the shatter plays before the new set reforms — roughly matches
// GoldBurst's "big" particle duration (0.7s) so the gap doesn't outlast
// the embers or cut them off early.
const BURST_MS = 600;

function deriveSkillChips(profiles: TeamCardMember[]): string[] {
  const counts = new Map<string, number>();
  for (const profile of profiles) {
    for (const skill of profile.skills) counts.set(skill, (counts.get(skill) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_CHIPS)
    .map(([skill]) => skill);
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 font-mono text-xs tracking-wide uppercase transition-colors duration-150",
        active
          ? "border-[rgba(212,175,55,0.5)] bg-[rgba(212,175,55,0.1)] text-gold"
          : "border-[rgba(255,255,255,0.14)] text-ink-dim hover:border-[rgba(255,255,255,0.3)] hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

/**
 * The real skill-filter/spark-burst interaction (SPEC.md Section 2/6),
 * deferred during Phase 5 and built for real as part of the sign-in/admin
 * motion-parity pass — it needed to exist as a real thing before "parity"
 * meant anything. Client component (filter state, burst timing) wrapping
 * the server-fetched profile list from team-teaser.tsx.
 *
 * Each card's own GoldBurst sits as a sibling to its fade/scale-down
 * animation, not a child of it — the embers need to stay at full opacity
 * for their own duration regardless of how fast the card underneath
 * fades, otherwise the burst reads as fizzling out early.
 */
export function TeamTeaserGrid({
  profiles,
  initialFeatured,
}: {
  profiles: TeamCardMember[];
  initialFeatured: TeamCardMember[];
}) {
  const chips = useMemo(() => deriveSkillChips(profiles), [profiles]);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [bursting, setBursting] = useState(false);

  const visible = useMemo(() => {
    if (!activeSkill) return initialFeatured;
    return profiles.filter((p) => p.skills.includes(activeSkill)).slice(0, MAX_VISIBLE);
  }, [activeSkill, profiles, initialFeatured]);

  function selectSkill(skill: string | null) {
    if (skill === activeSkill || bursting) return;
    setBursting(true);
    setTimeout(() => {
      setActiveSkill(skill);
      setBursting(false);
    }, BURST_MS);
  }

  return (
    <div>
      {chips.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <FilterChip active={activeSkill === null} onClick={() => selectSkill(null)}>
            All
          </FilterChip>
          {chips.map((skill) => (
            <FilterChip key={skill} active={activeSkill === skill} onClick={() => selectSkill(skill)}>
              {skill}
            </FilterChip>
          ))}
        </div>
      )}

      {visible.length > 0 ? (
        <>
          {/* min-[601px] and up — unchanged multi-column grid + spark-burst.
              items-start: cards are no longer uniformly aspect-locked (see
              team-card.tsx's sizing note), so default grid stretch would
              force every card in a row to the tallest one's height, leaving
              an empty gap under shorter cards' info panels. */}
          <div className="hidden items-start gap-6 min-[601px]:grid min-[601px]:grid-cols-3 min-[901px]:grid-cols-4">
            {visible.map((member, i) => (
              <div key={member.slug} className="relative">
                <GoldBurst active={bursting} size="big" />
                <motion.div
                  initial={{ opacity: 0, y: 14, scale: 0.96 }}
                  animate={{
                    opacity: bursting ? 0 : 1,
                    y: 0,
                    scale: bursting ? 0.9 : 1,
                  }}
                  transition={
                    bursting
                      ? { duration: 0.3, ease: "easeOut" }
                      : { duration: 0.4, delay: i * 0.05, ease: "easeOut" }
                  }
                >
                  <TeamCard member={member} />
                </motion.div>
              </div>
            ))}
          </div>

          {/* Below 601px — one full-width card, swipe/slide instead of a
              cramped multi-column grid (see team-carousel.tsx). Remounted
              (key) on filter change: a clean index-reset to the new set's
              first slide plus a plain fade rather than trying to adapt the
              grid's multi-card shatter/reform burst to a single visible
              slide, where "shatter" doesn't really read as anything. */}
          <div className="min-[601px]:hidden">
            <motion.div
              key={activeSkill ?? "all"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <TeamCarousel members={visible} />
            </motion.div>
          </div>
        </>
      ) : (
        <p className="text-sm text-ink-dim">No team members with that skill yet.</p>
      )}
    </div>
  );
}
