import Link from "next/link";
import { ServiceForm } from "../service-form";
import { createServiceAction } from "../actions";

export default function NewServicePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/services" className="text-sm text-ink-dim hover:text-ink">
          ← Services
        </Link>
      </div>
      <h1 className="font-display text-xl font-bold text-ink">New service</h1>
      <ServiceForm
        action={createServiceAction}
        defaultValues={{ slug: "", title: "", icon: "", shortDescription: "", fullDescription: "", deliverables: [] }}
        submitLabel="Create service"
      />
    </div>
  );
}
