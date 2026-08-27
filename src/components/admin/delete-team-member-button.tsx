"use client";

import { useId, useState } from "react";
import { AdminButton } from "@/components/admin/admin-button";
import { adminFieldClasses } from "@/components/admin/admin-field";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import { deleteTeamMemberAction, type DeleteTeamMemberState } from "@/app/admin/team/actions";

const initialState: DeleteTeamMemberState = {};

/**
 * Irreversible, so it gets real friction — type the member's exact name
 * to enable the confirm button — unlike the bare one-click DeleteRowButton
 * used for projects/services/community. Collapsed by default (same
 * expand-on-click shape as reviews' RejectForm) and rendered as its own
 * bordered "danger zone" wherever it's used, deliberately never placed
 * next to ToggleStatusButton — a misclick between "deactivate" and
 * "permanently delete" is exactly what this is meant to prevent.
 */
export function DeleteTeamMemberButton({ profileId, name }: { profileId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [, formAction, pending] = useToastAction(deleteTeamMemberAction, initialState, {
    successMessage: (s) => s.success,
  });
  const inputId = useId();
  const matches = confirmText === name;

  if (!open) {
    return (
      <AdminButton variant="danger" onClick={() => setOpen(true)}>
        Delete member
      </AdminButton>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="confirmName" value={confirmText} />
      <p className="text-sm text-ink-dim">
        This permanently deletes <strong className="text-ink">{name}</strong>&apos;s account, profile, and activity
        history, and removes them from every project they&apos;re credited on. This can&apos;t be undone.
      </p>
      <label htmlFor={inputId} className="flex flex-col gap-1.5 text-sm text-ink-dim">
        Type <strong className="text-ink">{name}</strong> to confirm
        <input
          id={inputId}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
          className={adminFieldClasses}
        />
      </label>
      <div className="flex items-center gap-2">
        <AdminButton type="submit" variant="danger" disabled={!matches || pending} className="gap-2">
          {pending && <Spinner />}
          {pending ? "Deleting…" : "Permanently delete"}
        </AdminButton>
        <AdminButton
          variant="ghost"
          type="button"
          onClick={() => {
            setOpen(false);
            setConfirmText("");
          }}
        >
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
