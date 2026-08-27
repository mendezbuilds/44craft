"use client";

import { AdminButton } from "@/components/admin/admin-button";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import { toggleUserStatusAction, type ToggleUserStatusState } from "@/app/admin/team/actions";

const initialState: ToggleUserStatusState = {};

/** `compact` is the table/card-row rendering on the list page — same
 * action, just sized to sit next to other row controls rather than the
 * full-size button the detail page uses. */
export function ToggleStatusButton({
  userId,
  status,
  compact = false,
}: {
  userId: string;
  status: "active" | "deactivated";
  compact?: boolean;
}) {
  const [, formAction, pending] = useToastAction(toggleUserStatusAction, initialState, {
    successMessage: (s) => s.success,
  });
  const active = status === "active";

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <AdminButton
        type="submit"
        variant={active ? "danger" : "primary"}
        disabled={pending}
        className={compact ? "gap-1.5 px-3 py-1 text-xs" : "gap-2"}
      >
        {pending && <Spinner className={compact ? "h-3 w-3" : undefined} />}
        {pending
          ? "Updating…"
          : active
            ? compact
              ? "Deactivate"
              : "Deactivate account"
            : compact
              ? "Reactivate"
              : "Reactivate account"}
      </AdminButton>
    </form>
  );
}
