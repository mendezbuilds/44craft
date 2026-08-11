import { cn } from "@/lib/cn";

/**
 * Shared loading indicator — was a one-off defined inline in
 * contact-section.tsx; pulled out so every async action (contact form,
 * admin actions, profile save, password change) uses the same element
 * instead of one-off spinners per form.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}
