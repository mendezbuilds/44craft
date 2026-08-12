import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { AvatarStack, type AvatarStackMember } from "@/components/avatar-stack";

export type ProjectCardData = {
  slug: string;
  title: string;
  coverImage: string | null;
  tags: string[];
  teamMembers: AvatarStackMember[];
};

/**
 * Cover image gets its own fixed aspect ratio, not a flex-1 child fighting
 * variable-length content below it for space — same reasoning as
 * team-card.tsx (see that file's sizing note for the mobile bug this
 * avoided repeating: a flex-1 image squeezed to zero height once the text
 * below it needed more room than a fixed-total-height card allowed).
 */
export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block h-full">
      <Card hover className="flex h-full flex-col overflow-hidden p-0">
        <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-gradient-to-br from-[#1a170f] to-[#0a0a08]">
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-ink-dim/40">
              44CRAFT
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 p-6">
          <h3 className="font-display text-lg font-bold text-ink transition-transform duration-300 group-hover:translate-x-1">
            {project.title}
          </h3>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}

          {project.teamMembers.length > 0 && (
            <div className="mt-auto pt-2">
              <AvatarStack members={project.teamMembers} />
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
