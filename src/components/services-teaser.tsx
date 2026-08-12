import Link from "next/link";
import { Section } from "@/components/ui/section";
import { DiamondMark } from "@/components/icons/diamond-mark";
import { ServiceCard } from "@/components/service-card";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { getAllServices } from "@/lib/services";

export async function ServicesTeaser() {
  const services = await getAllServices();

  return (
    <Section id="services" className="relative overflow-hidden py-24 min-[901px]:py-32">
      
      {/* Decorative background blueprint grid */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_20%,transparent_100%)] opacity-30" />

      <div className="relative z-10">
        <Reveal>
          <RevealItem className="mb-5 flex items-center gap-[10px] font-mono text-xs uppercase tracking-[3px] text-ink-dim">
            <DiamondMark size={6} glow={false} />
            What we offer
          </RevealItem>

          <RevealItem className="mb-16 flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-[560px] font-display text-[clamp(28px,4vw,40px)] font-bold leading-[1.15] tracking-[-1px] text-ink">
              Real work across web3, marketing, and community.
            </h2>
            <Link
              href="/services"
              className="group relative flex items-center gap-2 text-sm font-medium text-ink-dim transition-colors hover:text-[#d4af37]"
            >
              <span>See all services</span>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </RevealItem>

          {/* Now DB-backed — could genuinely be empty if an admin cleared
              the table, same reasoning as /services' own empty state. */}
          {services.length > 0 ? (
            <div className="grid gap-6 min-[601px]:grid-cols-2 min-[901px]:gap-12 relative">
              {/* Connecting center line */}
              <div className="absolute left-1/2 top-[10%] bottom-[10%] hidden w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-[#d4af37]/20 to-transparent min-[901px]:block" />

              {services.map((service, index) => (
                <RevealItem
                  key={service.slug}
                  className={index % 2 !== 0 ? "min-[901px]:mt-32" : ""}
                >
                  <ServiceCard service={service} />
                </RevealItem>
              ))}
            </div>
          ) : (
            <RevealItem>
              <p className="text-sm text-ink-dim">Services coming soon.</p>
            </RevealItem>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
