// Gold focus glow (design-correction pass) — was a plain `focus:border-ink`
// color swap; now matches the rest of the site's field treatment (contact
// form's underline sweep, profile editor, change-password form) with an
// actual glow ring instead of just a color change, and no default browser
// outline underneath it.
export const adminFieldClasses =
  "w-full rounded-[6px] border border-[rgba(255,255,255,0.14)] bg-transparent px-3 py-2 text-sm text-ink " +
  "outline-none transition-[border-color,box-shadow] duration-200 " +
  "focus:border-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.15)] placeholder:text-ink-dim/60";

export function AdminLabel({ children }: { children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5 text-sm text-ink-dim">{children}</label>;
}
