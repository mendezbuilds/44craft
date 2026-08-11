"use client";

import { useState } from "react";
import { AdminButton } from "@/components/admin/admin-button";
import { GoldBurst } from "@/components/motion/gold-burst";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import { approveProfileAction, type ApproveProfileState } from "./actions";

const initialState: ApproveProfileState = {};

/**
 * The small-scale approve moment (SPEC.md Section 2/8) — a handful of
 * gold embers burst from the button when clicked, a toned-down echo of
 * the public site's full spark-burst, before the row revalidates out of
 * the pending queue.
 */
export function ApproveButton({ profileId }: { profileId: string }) {
  const [bursting, setBursting] = useState(false);
  const [, formAction, pending] = useToastAction(approveProfileAction, initialState, {
    successMessage: (s) => s.success,
  });

  return (
    <form
      action={formAction}
      onSubmit={() => {
        setBursting(true);
        setTimeout(() => setBursting(false), 600);
      }}
      className="relative"
    >
      <input type="hidden" name="id" value={profileId} />
      <GoldBurst active={bursting} />
      <AdminButton type="submit" variant="primary" disabled={pending} className="gap-2">
        {pending && <Spinner />}
        {pending ? "Approving…" : "Approve"}
      </AdminButton>
    </form>
  );
}
