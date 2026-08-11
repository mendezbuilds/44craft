import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminButton } from "@/components/admin/admin-button";
import { DeleteRowButton } from "@/components/admin/delete-row-button";
import { ToastFromQuery } from "@/components/ui/toast-from-query";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { deleteServiceAction } from "./actions";

const TOAST_MESSAGES = { created: "Service created.", updated: "Service updated." };

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <Reveal onMount className="flex flex-col gap-6">
      <ToastFromQuery messages={TOAST_MESSAGES} />
      <RevealItem className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Services</h1>
        <AdminButton href="/admin/services/new">New service</AdminButton>
      </RevealItem>

      {services.length === 0 ? (
        <RevealItem>
          <p className="text-sm text-ink-dim">No services yet.</p>
        </RevealItem>
      ) : (
        <RevealItem>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)] text-left text-ink-dim">
                <th className="py-2 pr-4 font-normal">Title</th>
                <th className="py-2 pr-4 font-normal">Short description</th>
                <th className="py-2 pr-4 font-normal">Deliverables</th>
                <th className="py-2 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-[rgba(255,255,255,0.06)] align-top">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/services/${service.id}`} className="text-ink underline-offset-2 hover:underline">
                      {service.title}
                    </Link>
                  </td>
                  <td className="max-w-[280px] py-3 pr-4 text-ink-dim">{service.shortDescription}</td>
                  <td className="py-3 pr-4 text-ink-dim">{service.deliverables.length}</td>
                  <td className="py-3">
                    <div className="flex gap-3">
                      <AdminButton href={`/admin/services/${service.id}`} variant="ghost" className="px-3 py-1 text-xs">
                        Edit
                      </AdminButton>
                      <DeleteRowButton id={service.id} action={deleteServiceAction} successMessage="Service deleted." />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </RevealItem>
      )}
    </Reveal>
  );
}
