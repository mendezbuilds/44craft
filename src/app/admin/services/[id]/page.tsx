import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "../service-form";
import { updateServiceAction } from "../actions";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/services" className="text-sm text-ink-dim hover:text-ink">
          ← Services
        </Link>
      </div>
      <h1 className="font-display text-xl font-bold text-ink">Edit service</h1>
      <ServiceForm
        action={updateServiceAction}
        defaultValues={{
          id: service.id,
          slug: service.slug,
          title: service.title,
          icon: service.icon ?? "",
          shortDescription: service.shortDescription,
          fullDescription: service.fullDescription,
          deliverables: service.deliverables,
        }}
        submitLabel="Save changes"
      />
    </div>
  );
}
