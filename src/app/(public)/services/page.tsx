import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { ServiceCard } from "@/components/service-card";
import { services } from "@/lib/data/services";

export const metadata: Metadata = {
  title: "Services — 44Craft",
};

export default function ServicesPage() {
  return (
    <Section className="py-24 min-[901px]:py-32">
      <h1 className="mb-4 text-[clamp(32px,5vw,52px)] leading-[1.1] font-display font-bold tracking-[-1px] text-ink">
        Services
      </h1>
      <p className="mb-12 max-w-[520px] text-[17px] leading-[1.6] text-ink-dim">
        What we actually do, not a menu of buzzwords.
      </p>

      <div className="grid gap-5 min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>
    </Section>
  );
}
