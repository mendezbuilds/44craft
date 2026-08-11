import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { ServicesTeaser } from "@/components/services-teaser";
import { WhyUs } from "@/components/why-us";
import { TeamTeaser } from "@/components/team-teaser";
import { ContactSection } from "@/components/contact-section";
import { FinalCta } from "@/components/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <ServicesTeaser />
      <WhyUs />
      <TeamTeaser />
      <ContactSection />
      <FinalCta />
    </>
  );
}
