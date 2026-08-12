import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { ServiceCard } from "@/components/service-card";
import { getAllServices } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services — 44Craft",
};

export default async function ServicesPage() {
  const services = await getAllServices();

  return (
    <Section className="py-24 min-[901px]:py-32">
      <h1 className="mb-4 text-[clamp(32px,5vw,52px)] leading-[1.1] font-display font-bold tracking-[-1px] text-ink">
        Services
      </h1>
      <p className="mb-12 max-w-[520px] text-[17px] leading-[1.6] text-ink-dim">
        What we actually do, not a menu of buzzwords.
      </p>

      {/* Now DB-backed (was a static array that always had 4 entries) —
          an admin could genuinely empty this table out, so it needs a
          real empty state rather than assuming there's always something
          to map over. */}
      {services.length > 0 ? (
        <div className="grid gap-5 min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-dim">No services listed yet.</p>
      )}
    </Section>
  );
}
