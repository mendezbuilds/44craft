"use client";

import { AdminButton } from "@/components/admin/admin-button";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import { unpublishProfileAction, type UnpublishProfileState } from "@/app/admin/team/actions";

const initialState: UnpublishProfileState = {};

/**
 * Standalone visibility toggle — the other half of RepublishProfileButton,
 * for the "hide it, but leave the account alone" case (on leave, a stale
 * photo, whatever) rather than deactivating. One click, no heavy
 * confirmation: unlike delete, this is fully reversible in one more click
 * (RepublishProfileButton) as soon as it's back on.
 */
export function UnpublishProfileButton({ profileId }: { profileId: string }) {
  const [, formAction, pending] = useToastAction(unpublishProfileAction, initialState, {
    successMessage: (s) => s.success,
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="profileId" value={profileId} />
      <AdminButton type="submit" variant="ghost" disabled={pending} className="gap-2">
        {pending && <Spinner />}
        {pending ? "Unpublishing…" : "Unpublish"}
      </AdminButton>
    </form>
  );
}
