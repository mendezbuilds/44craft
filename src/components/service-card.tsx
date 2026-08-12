import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Service } from "@/lib/data/services";

/**
 * Shared between the homepage teaser and the /services index — one card,
 * one place to change it. Links to /services/[slug] (Phase 7).
 */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/services/${service.slug}`} className="group block h-full">
      <Card hover className="relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden p-8">
        {/* Subtle background glow on hover */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#8A6D1D]/0 via-transparent to-[#8A6D1D]/0 transition-colors duration-500 group-hover:from-[#8A6D1D]/10 group-hover:to-[#D4AF37]/5" />
        
        <div className="relative z-10">
          <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-white/5 bg-[#1a1917] transition-transform duration-300 group-hover:scale-110 group-hover:border-[#d4af37]/30">
            <Image 
              src={service.icon} 
              alt="" 
              width={28} 
              height={28} 
              className="opacity-70 transition-opacity group-hover:opacity-100" 
            />
          </div>
          <h3 className="mb-4 font-display text-2xl font-bold text-ink transition-transform duration-300 group-hover:translate-x-1">
            {service.title}
          </h3>
          <p className="text-[15px] leading-relaxed text-ink-dim transition-colors duration-300 group-hover:text-ink/80">
            {service.shortDescription}
          </p>
        </div>
        
        <div className="relative z-10 mt-8 flex items-center text-sm font-semibold text-[#d4af37] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
          Explore Service 
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </Card>
    </Link>
  );
}
