"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { serviceSchema } from "@/lib/validation";

export type ServiceFormState = { error?: string };

/** One deliverable per line — easier to type than JSON, and matches the
 * format /services/[slug] renders publicly. This data is now actually
 * connected to that public rendering (src/lib/services.ts) — see
 * scripts/migrate-services-to-db.ts for how the previous static-file gap
 * was closed. */
function parseDeliverables(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string") return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseServiceForm(formData: FormData) {
  return serviceSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    icon: formData.get("icon") ?? "",
    shortDescription: formData.get("shortDescription"),
    fullDescription: formData.get("fullDescription"),
    deliverables: parseDeliverables(formData.get("deliverables")),
  });
}

export async function createServiceAction(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  await requireAdmin();
  const parsed = parseServiceForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form for errors." };
  }
  const { icon, ...rest } = parsed.data;

  const existing = await prisma.service.findUnique({ where: { slug: rest.slug } });
  if (existing) return { error: "That slug is already in use." };

  await prisma.service.create({ data: { ...rest, icon: icon || null } });

  revalidatePath("/admin/services");
  // The actual point of this whole migration — Service now has real public
  // pages to keep in sync (they didn't exist when this action was first
  // written, hence the gap). Homepage too: ServicesTeaser renders the same
  // list.
  revalidatePath("/services");
  revalidatePath(`/services/${rest.slug}`);
  revalidatePath("/");
  redirect("/admin/services?toast=created");
}

export async function updateServiceAction(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing service id." };

  const parsed = parseServiceForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form for errors." };
  }
  const { icon, ...rest } = parsed.data;

  const existing = await prisma.service.findUnique({ where: { slug: rest.slug } });
  if (existing && existing.id !== id) return { error: "That slug is already in use." };

  const current = await prisma.service.findUnique({ where: { id }, select: { slug: true } });

  await prisma.service.update({ where: { id }, data: { ...rest, icon: icon || null } });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath(`/services/${rest.slug}`);
  if (current && current.slug !== rest.slug) {
    revalidatePath(`/services/${current.slug}`); // old slug's cached page also needs invalidating if it changed
  }
  revalidatePath("/");
  redirect("/admin/services?toast=updated");
}

export type DeleteServiceState = { error?: string; success?: string };

export async function deleteServiceAction(
  _prevState: DeleteServiceState,
  formData: FormData,
): Promise<DeleteServiceState> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing service id." };

  const deleted = await prisma.service.delete({ where: { id } });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath(`/services/${deleted.slug}`);
  revalidatePath("/");
  return { success: "Service deleted." };
}
