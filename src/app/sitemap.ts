import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/projects";
import { getAllServices } from "@/lib/services";
import { getPublishedTeamProfiles } from "@/lib/team-profile";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://44craft.com";

/**
 * Only the real public site — no /admin, /dashboard, /signin,
 * /accept-invite (those all carry `robots: noindex` on top of simply not
 * belonging in a sitemap). Dynamic sections are generated from the same
 * queries the pages themselves render from, so a new project/service/
 * team member shows up here without a code change.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, services, team] = await Promise.all([
    getAllProjects(),
    getAllServices(),
    getPublishedTeamProfiles(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: APP_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/team`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${APP_URL}/services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${APP_URL}/community`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const teamRoutes: MetadataRoute.Sitemap = team.map((member) => ({
    url: `${APP_URL}/team/${member.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${APP_URL}/services/${service.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${APP_URL}/projects/${project.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: project.updatedAt,
  }));

  return [...staticRoutes, ...teamRoutes, ...serviceRoutes, ...projectRoutes];
}
