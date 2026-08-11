"use client";

import { AdminButton } from "@/components/admin/admin-button";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import { toggleUserStatusAction, type ToggleUserStatusState } from "../actions";

const initialState: ToggleUserStatusState = {};

export function ToggleStatusButton({ userId, status }: { userId: string; status: "active" | "deactivated" }) {
  const [, formAction, pending] = useToastAction(toggleUserStatusAction, initialState, {
    successMessage: (s) => s.success,
  });
  const active = status === "active";

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <AdminButton type="submit" variant={active ? "danger" : "primary"} disabled={pending} className="gap-2">
        {pending && <Spinner />}
        {pending ? "Updating…" : active ? "Deactivate account" : "Reactivate account"}
      </AdminButton>
    </form>
  );
}
