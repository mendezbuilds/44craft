const fieldClasses =
  "peer w-full resize-none border-b border-[rgba(255,255,255,0.16)] bg-transparent pt-3 pb-2 text-base text-ink " +
  "outline-none transition-colors duration-200 placeholder:text-transparent";

// Floating label sits at input height when empty, floats up + shrinks +
// turns gold on focus or once filled — driven by `:placeholder-shown`
// (hence the single-space placeholder on each field), no JS needed.
const floatingLabelClasses =
  "pointer-events-none absolute left-0 top-3 text-base text-ink-dim transition-all duration-200 " +
  "peer-focus:-top-3 peer-focus:text-xs peer-focus:text-gold " +
  "peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-xs";

// The actual focus indicator: a hairline that sweeps left-to-right instead
// of the field just changing color — same gold as everything else, but a
// bit of motion instead of a flat state change.
const focusSweepClasses =
  "pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold " +
  "transition-transform duration-300 ease-out peer-focus:scale-x-100";

/**
 * Pulled out of contact-section.tsx (its original and, until the sign-in/
 * admin design-correction pass, only home) so sign-in and accept-invite
 * can use the exact same field treatment rather than a different one —
 * "input fields matching the contact form's styling" per the client
 * escalation, not just a similar one.
 */
export function FloatingField({
  id,
  name,
  label,
  type = "text",
  textarea = false,
  rows,
  autoComplete,
  minLength,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  rows?: number;
  autoComplete?: string;
  minLength?: number;
}) {
  return (
    <div className="relative">
      {textarea ? (
        <textarea id={id} name={name} placeholder=" " required rows={rows ?? 4} className={fieldClasses} />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          placeholder=" "
          required
          autoComplete={autoComplete}
          minLength={minLength}
          className={fieldClasses}
        />
      )}
      <label htmlFor={id} className={floatingLabelClasses}>
        {label}
      </label>
      <span aria-hidden="true" className={focusSweepClasses} />
    </div>
  );
}
