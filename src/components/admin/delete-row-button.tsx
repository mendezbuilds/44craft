"use client";

import { AdminButton } from "@/components/admin/admin-button";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";

type DeleteState = { error?: string; success?: string };

/**
 * One reusable delete-row action, used across projects/services/community
 * (previously three near-identical `<form action={deleteXAction}>` blocks
 * with no loading or feedback state at all).
 */
export function DeleteRowButton({
  id,
  action,
  successMessage,
}: {
  id: string;
  action: (prevState: DeleteState, formData: FormData) => Promise<DeleteState>;
  successMessage: string;
}) {
  const [, formAction, pending] = useToastAction(action, {} as DeleteState, { successMessage });

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <AdminButton type="submit" variant="danger" disabled={pending} className="gap-1.5 px-3 py-1 text-xs">
        {pending && <Spinner className="h-3 w-3" />}
        {pending ? "Deleting…" : "Delete"}
      </AdminButton>
    </form>
  );
}
