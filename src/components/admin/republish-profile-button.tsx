"use client";

import { AdminButton } from "@/components/admin/admin-button";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import { republishProfileAction, type RepublishProfileState } from "@/app/admin/team/actions";

const initialState: RepublishProfileState = {};

/**
 * Only rendered where the profile is actually eligible — was published
 * before, isn't now, and the account is active (see the eligibility
 * check in the server action itself, re-verified there rather than
 * trusted from just not rendering this button). A deliberate, separate
 * click from reactivating the account, on purpose — see
 * toggleUserStatusAction's comment for why the two aren't the same
 * action.
 */
export function RepublishProfileButton({ profileId }: { profileId: string }) {
  const [, formAction, pending] = useToastAction(republishProfileAction, initialState, {
    successMessage: (s) => s.success,
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="profileId" value={profileId} />
      <AdminButton type="submit" variant="primary" disabled={pending} className="gap-2">
        {pending && <Spinner />}
        {pending ? "Publishing…" : "Republish profile"}
      </AdminButton>
    </form>
  );
}
