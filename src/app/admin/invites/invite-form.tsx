"use client";

import { AdminButton } from "@/components/admin/admin-button";
import { adminFieldClasses, AdminLabel } from "@/components/admin/admin-field";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import { sendInviteAction, type SendInviteState } from "./actions";

const initialState: SendInviteState = {};

export function InviteForm() {
  const [state, formAction, pending] = useToastAction(sendInviteAction, initialState, {
    // sendInviteAction's own success text already names the recipient —
    // reuse it verbatim rather than a separate fixed toast message.
    successMessage: (s) => s.success,
  });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <AdminLabel>
        Email
        <input
          type="email"
          name="email"
          required
          placeholder="name@example.com"
          className={`${adminFieldClasses} w-64`}
        />
      </AdminLabel>

      <AdminLabel>
        Role
        <select name="role" defaultValue="team" className={`${adminFieldClasses} w-32`}>
          <option value="team">Team</option>
          <option value="admin">Admin</option>
        </select>
      </AdminLabel>

      <AdminButton type="submit" variant="primary" disabled={pending} className="gap-2">
        {pending && <Spinner />}
        {pending ? "Sending…" : "Send invite"}
      </AdminButton>

      {state.error && (
        <p className="w-full text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state.success && <p className="w-full text-sm text-ink-dim">{state.success}</p>}
    </form>
  );
}
