"use client";

import { useId, useState } from "react";
import { AdminButton } from "@/components/admin/admin-button";
import { adminFieldClasses } from "@/components/admin/admin-field";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import { promoteToAdminAction, demoteToTeamAction, type SetAdminRoleState } from "@/app/admin/team/actions";

const initialState: SetAdminRoleState = {};

/**
 * One component for both promote and demote — same shape either way
 * (type-their-name-to-confirm, same weight as DeleteTeamMemberButton:
 * "a meaningful privilege change, same seriousness as delete" per the
 * brief), just a different action/label/copy depending on `mode`. The
 * "can't remove the last admin" guard lives in demoteToTeamAction
 * itself (checked live at write time), not here — this only surfaces
 * whatever error that returns.
 */
export function SetAdminRoleButton({
  mode,
  userId,
  name,
}: {
  mode: "promote" | "demote";
  userId: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const action = mode === "promote" ? promoteToAdminAction : demoteToTeamAction;
  const [state, formAction, pending] = useToastAction(action, initialState, {
    successMessage: (s) => s.success,
  });
  const inputId = useId();
  const matches = confirmText === name;

  if (!open) {
    return (
      <AdminButton variant={mode === "promote" ? "primary" : "danger"} onClick={() => setOpen(true)}>
        {mode === "promote" ? "Make admin" : "Remove admin"}
      </AdminButton>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="confirmName" value={confirmText} />
      <p className="text-sm text-ink-dim">
        {mode === "promote" ? (
          <>
            This gives <strong className="text-ink">{name}</strong> full access to <code>/admin</code> — every
            member&apos;s data, invites, and site content.
          </>
        ) : (
          <>
            This removes <strong className="text-ink">{name}</strong>&apos;s admin access. They keep their team
            account and profile, they just can&apos;t reach <code>/admin</code> anymore.
          </>
        )}
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
        <AdminButton type="submit" variant={mode === "promote" ? "primary" : "danger"} disabled={!matches || pending} className="gap-2">
          {pending && <Spinner />}
          {pending ? "Updating…" : mode === "promote" ? "Confirm make admin" : "Confirm remove admin"}
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
      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
