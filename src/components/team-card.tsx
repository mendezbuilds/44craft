"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Tag } from "@/components/ui/tag";
import { initials } from "@/lib/initials";

export type TeamCardMember = {
  slug: string;
  name: string;
  roleTitle: string;
  photo: string | null;
  skills: string[];
};

const MAX_TILT = 8; // degrees

/**
 * Single-face card — the earlier flip interaction was removed on request
 * (felt like unnecessary friction to see a name/role). The whole card is
 * a plain link to /team/[slug] (real page as of Phase 5), with a
 * persistent breathing gold glow border (.team-card-glow, globals.css)
 * that intensifies on hover.
 *
 * Image and info are two separate stacked zones, not an overlay — an
 * earlier version put name/role/skills on a scrim over the bottom of the
 * photo area, which covered part of it. Info now lives in its own solid
 * panel below the image instead. Falls back to large initials (same
 * treatment as before) when a member has no photo yet.
 *
 * Cursor-reactive 3D tilt (SPEC.md Section 2/6, "client" component now
 * because of it) — pointer position within the card drives rotateX/
 * rotateY through a spring, perspective on the outer wrapper. Explicitly
 * skipped under prefers-reduced-motion: <MotionConfig reducedMotion="user">
 * in the root layout only patches Framer's own animate/variants system,
 * not raw motion-value writes from a pointer handler, so this checks
 * matchMedia itself rather than relying on that.
 *
 * Sizing: only the outermost wrapper carries `aspect-[3/4]`, and nothing
 * else on it — no competing `h-full`. That resolves the card's height
 * unambiguously from its own (definite, grid-track) width, no percentage
 * chain involved. The tilt wrapper underneath is `absolute inset-0`
 * rather than `h-full`, so it fills that resolved box directly instead of
 * asking the browser to resolve `height:100%` against it — verified live
 * (previous version of this fix reasoned through the CSS spec instead of
 * actually checking a real render, and was still broken: aspect-ratio and
 * height:100% on the same element are competing declarations, and even
 * with that resolved, `h-full` one level down still depends on the
 * browser treating the aspect-ratio'd box's resolved height as "definite"
 * for percentage purposes, which isn't guaranteed inside a CSS Grid item).
 * `inset-0` doesn't have that dependency — it's resolved against the
 * nearest positioned ancestor's actual box, full stop.
 */
export function TeamCard({ member }: { member: TeamCardMember }) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [MAX_TILT, -MAX_TILT]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-MAX_TILT, MAX_TILT]), { stiffness: 300, damping: 30 });

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handlePointerLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ perspective: 800 }}
      className="relative aspect-[3/4]"
    >
      <motion.div style={{ rotateX, rotateY }} className="absolute inset-0">
        <Link
          href={`/team/${member.slug}`}
          className="team-card-glow group flex h-full flex-col overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] transition-[border-color] duration-300 hover:border-[rgba(212,175,55,0.5)]"
        >
          {/* Image area — a real photo once uploaded, initials placeholder until then */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a170f] to-[#0a0a08]">
            {member.photo ? (
              <Image
                src={member.photo}
                alt=""
                fill
                sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <span
                aria-hidden="true"
                className="team-card-initials pointer-events-none select-none font-display font-extrabold transition-transform duration-500 group-hover:scale-105"
              >
                {initials(member.name)}
              </span>
            )}
          </div>

          {/* Info area — separate panel, doesn't sit over the image */}
          <div className="border-t border-[rgba(255,255,255,0.08)] bg-[#141310] px-4 py-4">
            <h3 className="font-display text-base font-bold text-ink">{member.name}</h3>
            <p className="mb-3 text-sm text-ink-dim">{member.roleTitle}</p>
            <div className="flex flex-wrap gap-2">
              {member.skills.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
