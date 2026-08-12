import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects — 44Craft",
};

/**
 * `onMount`, not the scroll-triggered Reveal — a top-level page's header
 * and first row of cards sit above the fold on load, the same condition
 * that caused admin's invisible-button bug (viewport-intersection timing
 * is layout-dependent in ways content meant to be visible immediately has
 * no reason to accept). See reveal.tsx's own note.
 */
export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <Section className="py-24 min-[901px]:py-32">
      <Reveal onMount className="flex flex-col gap-12">
        <RevealItem>
          <h1 className="mb-4 text-[clamp(32px,5vw,52px)] leading-[1.1] font-display font-bold tracking-[-1px] text-ink">
            Projects
          </h1>
          <p className="max-w-[520px] text-[17px] leading-[1.6] text-ink-dim">
            Real work we&apos;ve shipped, not case studies dressed up for a pitch deck.
          </p>
        </RevealItem>

        {projects.length > 0 ? (
          <RevealItem>
            <div className="grid gap-6 min-[601px]:grid-cols-2 min-[1024px]:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={{
                    slug: project.slug,
                    title: project.title,
                    coverImage: project.coverImage,
                    tags: project.tags,
                    teamMembers: project.teamMembers,
                  }}
                />
              ))}
            </div>
          </RevealItem>
        ) : (
          <RevealItem className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141310] px-8 py-16 text-center">
            <p className="font-display text-lg font-bold text-ink">Coming soon.</p>
            <p className="mx-auto mt-2 max-w-[420px] text-sm text-ink-dim">
              We&apos;re early — real projects land here as we ship them, not before.
            </p>
          </RevealItem>
        )}
      </Reveal>
    </Section>
  );
}
