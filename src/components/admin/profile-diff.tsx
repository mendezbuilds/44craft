import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ProfileSnapshot, Socials } from "@/lib/team-profile";

function isEqual(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Side-by-side before/after below 480px means each column is under ~140px
// after padding — long names/bios wrap into an unreadable ladder. Stacked
// below that breakpoint instead, with each block's own "Published"/
// "Pending" label (the shared header row above only makes sense once
// they're actually side by side).
function TextRow({ label, before, after }: { label: string; before: string; after: string }) {
  const changed = !isEqual(before, after);
  return (
    <div className={cn("grid grid-cols-1 gap-2 rounded-lg px-3 py-2 min-[480px]:grid-cols-2 min-[480px]:gap-4", changed && "bg-white/[0.04]")}>
      <div>
        <p className="mb-0.5 font-mono text-[11px] tracking-wide text-ink-dim uppercase">
          {label} <span className="min-[480px]:hidden">(published)</span>
        </p>
        <p className={cn("text-sm", changed ? "text-ink-dim/70 line-through" : "text-ink-dim")}>{before || "—"}</p>
      </div>
      <div>
        <p className="mb-0.5 font-mono text-[11px] tracking-wide text-ink-dim uppercase min-[480px]:invisible">
          {label} <span className="min-[480px]:hidden">(pending)</span>
        </p>
        <p className={cn("text-sm", changed ? "font-medium text-ink" : "text-ink-dim")}>{after || "—"}</p>
      </div>
    </div>
  );
}

function PhotoRow({ before, after }: { before: string | null; after: string | null }) {
  const changed = before !== after;
  return (
    <div className={cn("grid grid-cols-2 gap-4 rounded-lg px-3 py-2", changed && "bg-white/[0.04]")}>
      {[before, after].map((src, i) => (
        <div key={i}>
          <p className="mb-1 font-mono text-[11px] tracking-wide text-ink-dim uppercase">
            {i === 0 ? "Photo (before)" : "Photo (after)"}
          </p>
          {src ? (
            <Image src={src} alt="" width={56} height={56} className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)] text-xs text-ink-dim">
              none
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SkillsRow({ before, after }: { before: string[]; after: string[] }) {
  const added = after.filter((s) => !before.includes(s));
  const removed = before.filter((s) => !after.includes(s));
  const changed = added.length > 0 || removed.length > 0;

  return (
    <div className={cn("rounded-lg px-3 py-2", changed && "bg-white/[0.04]")}>
      <p className="mb-1.5 font-mono text-[11px] tracking-wide text-ink-dim uppercase">Skills</p>
      {changed ? (
        <div className="flex flex-wrap gap-1.5">
          {after.map((skill) => (
            <span
              key={skill}
              className={cn(
                "rounded-full border px-2 py-0.5 font-mono text-xs",
                added.includes(skill)
                  ? "border-ink/30 text-ink"
                  : "border-[rgba(255,255,255,0.14)] text-ink-dim",
              )}
            >
              {added.includes(skill) ? "+ " : ""}
              {skill}
            </span>
          ))}
          {removed.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-red-500/30 px-2 py-0.5 font-mono text-xs text-red-400/80 line-through"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {after.map((skill) => (
            <span key={skill} className="rounded-full border border-[rgba(255,255,255,0.14)] px-2 py-0.5 font-mono text-xs text-ink-dim">
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function socialsList(socials: Socials) {
  return Object.entries(socials)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
}

/**
 * Side-by-side diff — `before` is null for a member's first-ever
 * submission (nothing published yet to compare against). Only rows that
 * actually changed get the highlight treatment; unchanged fields render
 * plainly so the reviewer's eye goes straight to what needs a decision.
 */
export function ProfileDiff({ before, after }: { before: ProfileSnapshot | null; after: ProfileSnapshot }) {
  const beforeSnapshot: ProfileSnapshot = before ?? {
    name: "",
    roleTitle: "",
    photo: null,
    bio: "",
    skills: [],
    socials: {},
  };

  return (
    <div className="flex flex-col gap-1">
      {!before && (
        <p className="mb-1 text-xs text-ink-dim">First submission — nothing published to compare against yet.</p>
      )}
      <div className="mb-1 hidden grid-cols-2 gap-4 px-3 min-[480px]:grid">
        <p className="font-mono text-[11px] tracking-wide text-ink-dim uppercase">Published</p>
        <p className="font-mono text-[11px] tracking-wide text-ink-dim uppercase">Pending</p>
      </div>
      <PhotoRow before={beforeSnapshot.photo} after={after.photo} />
      <TextRow label="Name" before={beforeSnapshot.name} after={after.name} />
      <TextRow label="Role" before={beforeSnapshot.roleTitle} after={after.roleTitle} />
      <TextRow label="Bio" before={beforeSnapshot.bio} after={after.bio} />
      <SkillsRow before={beforeSnapshot.skills} after={after.skills} />
      <TextRow label="Socials" before={socialsList(beforeSnapshot.socials)} after={socialsList(after.socials)} />
    </div>
  );
}
