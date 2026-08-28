"use client";

import { AdminButton } from "@/components/admin/admin-button";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import { toggleFeaturedAction, type ToggleFeaturedState } from "@/app/admin/team/actions";

const initialState: ToggleFeaturedState = {};

export function FeaturedToggleButton({ profileId, featured }: { profileId: string; featured: boolean }) {
  const [, formAction, pending] = useToastAction(toggleFeaturedAction, initialState, {
    successMessage: (s) => s.success,
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="profileId" value={profileId} />
      <AdminButton type="submit" variant={featured ? "danger" : "ghost"} disabled={pending} className="gap-2">
        {pending && <Spinner />}
        {pending ? "Updating…" : featured ? "Remove from homepage" : "Feature on homepage"}
      </AdminButton>
    </form>
  );
}
