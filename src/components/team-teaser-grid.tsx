"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TeamCard, type TeamCardMember } from "@/components/team-card";
import { TeamCarousel } from "@/components/team-carousel";
import { GoldBurst } from "@/components/motion/gold-burst";
import { teamMembersForService } from "@/lib/service-matching";
import { cn } from "@/lib/cn";

const MAX_VISIBLE = 8;
// How long the shatter plays before the new set reforms — roughly matches
// GoldBurst's "big" particle duration (0.7s) so the gap doesn't outlast
// the embers or cut them off early.
const BURST_MS = 600;

export type FilterService = { slug: string; title: string };

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
 * Filter chips are the fixed services list, not raw skill strings —
 * deriving chips straight from everyone's free-text skills meant the row
 * grew unbounded as the team grew and people typed different things
 * (two chips for what's really one skill, one-off entries nobody else
 * shares). Services are a small, admin-controlled, already-existing
 * taxonomy (the same one /services renders), so the chip count stays
 * constant regardless of team size — teamMembersForService (lib/services,
 * already built for /services/[slug]'s "who you'd work with" section) is
 * reused here in the same direction it was written for, just triggered
 * from the team side instead.
 *
 * Each card's own GoldBurst sits as a sibling to its fade/scale-down
 * animation, not a child of it — the embers need to stay at full opacity
 * for their own duration regardless of how fast the card underneath
 * fades, otherwise the burst reads as fizzling out early.
 */
export function TeamTeaserGrid({
  profiles,
  initialFeatured,
  services,
}: {
  profiles: TeamCardMember[];
  initialFeatured: TeamCardMember[];
  services: FilterService[];
}) {
  const [activeService, setActiveService] = useState<string | null>(null);
  const [bursting, setBursting] = useState(false);

  const visible = useMemo(() => {
    if (!activeService) return initialFeatured;
    return teamMembersForService(activeService, profiles).slice(0, MAX_VISIBLE);
  }, [activeService, profiles, initialFeatured]);

  function selectService(slug: string | null) {
    if (slug === activeService || bursting) return;
    setBursting(true);
    setTimeout(() => {
      setActiveService(slug);
      setBursting(false);
    }, BURST_MS);
  }

  return (
    <div>
      {services.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <FilterChip active={activeService === null} onClick={() => selectService(null)}>
            All
          </FilterChip>
          {services.map((service) => (
            <FilterChip key={service.slug} active={activeService === service.slug} onClick={() => selectService(service.slug)}>
              {service.title}
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
                  <TeamCard member={member} hideSkills />
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
              key={activeService ?? "all"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <TeamCarousel members={visible} />
            </motion.div>
          </div>
        </>
      ) : (
        <p className="text-sm text-ink-dim">No team members covering that yet.</p>
      )}
    </div>
  );
}
