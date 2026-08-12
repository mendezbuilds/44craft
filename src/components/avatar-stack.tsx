import Image from "next/image";
import Link from "next/link";
import { initials } from "@/lib/initials";

export type AvatarStackMember = { slug: string; name: string; photo: string | null };

/**
 * Small overlapping avatar row for project cards (index) and "Built by"
 * (detail). `size="lg"` (detail pages, not nested inside another link) is
 * a real clickable row — each avatar links to /team/[slug]. `size="sm"`
 * (project cards) is decorative only, no links — ProjectCard already wraps
 * the whole card in a Link to the project, and nesting a real <a> inside
 * that <a> is invalid HTML (confirmed: caused an actual hydration-mismatch
 * console error in testing, not just a theoretical concern — same
 * team-card-compact.tsx reasoning applied there for its social-icon row,
 * missed here on the first pass and caught by testing with real seeded
 * data rather than just the DB's empty-state).
 */
export function AvatarStack({ members, size = "sm" }: { members: AvatarStackMember[]; size?: "sm" | "lg" }) {
  if (members.length === 0) return null;

  if (size === "lg") {
    return (
      <ul className="flex flex-wrap gap-4">
        {members.map((member) => (
          <li key={member.slug}>
            <Link
              href={`/team/${member.slug}`}
              className="group flex items-center gap-2.5 rounded-full border border-[rgba(255,255,255,0.08)] py-1.5 pr-4 pl-1.5 transition-colors duration-150 hover:border-[rgba(212,175,55,0.4)]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(255,255,255,0.14)] bg-[#141310] font-display text-[10px] font-bold text-gold">
                {member.photo ? (
                  <Image src={member.photo} alt="" width={32} height={32} className="h-full w-full object-cover" />
                ) : (
                  initials(member.name)
                )}
              </span>
              <span className="text-sm text-ink-dim transition-colors group-hover:text-ink">{member.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex -space-x-2.5">
      {members.map((member) => (
        <span
          key={member.slug}
          title={member.name}
          className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#141310] bg-[#0a0a08] font-display text-[10px] font-bold text-gold"
        >
          {member.photo ? (
            <Image src={member.photo} alt="" width={32} height={32} className="h-full w-full object-cover" />
          ) : (
            initials(member.name)
          )}
        </span>
      ))}
    </div>
  );
}
