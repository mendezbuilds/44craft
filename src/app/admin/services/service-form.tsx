"use client";

import { AdminButton } from "@/components/admin/admin-button";
import { adminFieldClasses, AdminLabel } from "@/components/admin/admin-field";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import type { ServiceFormState } from "./actions";

type ServiceFormValues = {
  id?: string;
  slug: string;
  title: string;
  icon: string;
  shortDescription: string;
  fullDescription: string;
  deliverables: string[];
};

const initialState: ServiceFormState = {};

export function ServiceForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ServiceFormState, formData: FormData) => Promise<ServiceFormState>;
  defaultValues: ServiceFormValues;
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
        Slug
        <input name="slug" required defaultValue={defaultValues.slug} className={adminFieldClasses} />
      </AdminLabel>

      <AdminLabel>
        Icon (optional)
        <input name="icon" defaultValue={defaultValues.icon} className={adminFieldClasses} placeholder="icon name or emoji" />
      </AdminLabel>

      <AdminLabel>
        Short description
        <input
          name="shortDescription"
          required
          maxLength={160}
          defaultValue={defaultValues.shortDescription}
          className={adminFieldClasses}
        />
      </AdminLabel>

      <AdminLabel>
        Full description
        <textarea
          name="fullDescription"
          required
          rows={5}
          defaultValue={defaultValues.fullDescription}
          className={`${adminFieldClasses} resize-none`}
        />
      </AdminLabel>

      <AdminLabel>
        Deliverables (one per line)
        <textarea
          name="deliverables"
          rows={5}
          defaultValue={defaultValues.deliverables.join("\n")}
          className={`${adminFieldClasses} resize-none`}
        />
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
