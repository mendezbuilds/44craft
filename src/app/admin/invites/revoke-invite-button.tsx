"use client";

import { useToastAction } from "@/lib/use-toast-action";
import { AdminButton } from "@/components/admin/admin-button";
import { Spinner } from "@/components/ui/spinner";
import { revokeInviteAction, type RevokeInviteState } from "./actions";

const initialState: RevokeInviteState = {};

export function RevokeInviteButton({ inviteId }: { inviteId: string }) {
  const [, formAction, pending] = useToastAction(revokeInviteAction, initialState, {
    successMessage: "Invite revoked.",
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={inviteId} />
      <AdminButton type="submit" variant="danger" disabled={pending} className="px-3 py-1 text-xs">
        {pending ? <Spinner /> : "Revoke"}
      </AdminButton>
    </form>
  );
}
