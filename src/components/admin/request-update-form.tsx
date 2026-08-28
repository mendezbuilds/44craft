"use client";

import { useState } from "react";
import { AdminButton } from "@/components/admin/admin-button";
import { adminFieldClasses } from "@/components/admin/admin-field";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import { requestProfileUpdateAction, type RequestProfileUpdateState } from "@/app/admin/team/actions";

const initialState: RequestProfileUpdateState = {};

/**
 * The proactive counterpart to reviews' RejectForm — same collapsed-
 * until-clicked shape, same note field, but reachable with no pending
 * submission required (the server action itself refuses if one exists,
 * pointing back to /admin/reviews instead — that case already has its
 * own more complete handling).
 */
export function RequestUpdateForm({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useToastAction(requestProfileUpdateAction, initialState, {
    successMessage: (s) => s.success,
  });

  if (!open) {
    return (
      <AdminButton variant="ghost" onClick={() => setOpen(true)}>
        Request profile update
      </AdminButton>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="profileId" value={profileId} />
      <textarea
        name="note"
        required
        rows={2}
        placeholder="What needs to change? (required — shown to the member)"
        className={`${adminFieldClasses} resize-none`}
      />
      <div className="flex items-center gap-2">
        <AdminButton type="submit" variant="primary" disabled={pending} className="gap-2">
          {pending && <Spinner />}
          {pending ? "Sending…" : "Send request"}
        </AdminButton>
        <AdminButton variant="ghost" type="button" onClick={() => setOpen(false)}>
          Cancel
        </AdminButton>
      </div>
      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
