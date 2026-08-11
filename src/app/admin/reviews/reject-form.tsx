"use client";

import { useState } from "react";
import { AdminButton } from "@/components/admin/admin-button";
import { adminFieldClasses } from "@/components/admin/admin-field";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import { rejectProfileAction, type RejectProfileState } from "./actions";

const initialState: RejectProfileState = {};

/** Collapsed to a single "Reject" button until clicked, so the note field
 * doesn't sit open and blank next to every pending row by default. */
export function RejectForm({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useToastAction(rejectProfileAction, initialState, {
    successMessage: "Changes requested — the member will see your note on their dashboard.",
  });

  if (!open) {
    return (
      <AdminButton variant="danger" onClick={() => setOpen(true)}>
        Reject
      </AdminButton>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={profileId} />
      <textarea
        name="note"
        required
        rows={2}
        placeholder="What needs to change? (required — shown to the member)"
        className={`${adminFieldClasses} resize-none`}
      />
      <div className="flex items-center gap-2">
        <AdminButton type="submit" variant="danger" disabled={pending} className="gap-2">
          {pending && <Spinner />}
          {pending ? "Sending…" : "Confirm reject"}
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
