"use client";

import { AdminButton } from "@/components/admin/admin-button";
import { adminFieldClasses, AdminLabel } from "@/components/admin/admin-field";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import type { CommunityFormState } from "./actions";

type CommunityFormValues = {
  id?: string;
  title: string;
  body: string;
  date: string; // YYYY-MM-DD, for an <input type="date">
  image: string;
};

const initialState: CommunityFormState = {};

export function CommunityForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: CommunityFormState, formData: FormData) => Promise<CommunityFormState>;
  defaultValues: CommunityFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useToastAction(action, initialState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {defaultValues.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <AdminLabel>
        Title
        <input name="title" required defaultValue={defaultValues.title} className={adminFieldClasses} />
      </AdminLabel>

      <AdminLabel>
        Date
        <input type="date" name="date" required defaultValue={defaultValues.date} className={adminFieldClasses} />
      </AdminLabel>

      <AdminLabel>
        Body
        <textarea
          name="body"
          required
          rows={6}
          defaultValue={defaultValues.body}
          className={`${adminFieldClasses} resize-none`}
        />
      </AdminLabel>

      <AdminLabel>
        Image URL (optional)
        <input
          name="image"
          defaultValue={defaultValues.image}
          className={adminFieldClasses}
          placeholder="https://<project>.supabase.co/storage/v1/object/public/…"
        />
        <span className="text-xs text-ink-dim">Upload to Supabase Storage first, then paste the public URL — other hosts aren&apos;t accepted.</span>
      </AdminLabel>

      <div>
        <AdminButton type="submit" variant="primary" disabled={pending} className="gap-2">
          {pending && <Spinner />}
          {pending ? "Saving…" : submitLabel}
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
