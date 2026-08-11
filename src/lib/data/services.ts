// Real service lines per SPEC.md Section 1 ("web3, marketing, social media
// management, and more"). No fake client counts or invented specialties —
// deliverables are described plainly, per the brand voice.
export type Service = {
  slug: string;
  title: string;
  // Custom faceted-gem icons (docs/icon-*.svg → public/icons/) — one per
  // service, matched 1:1 on purpose. If a service is added without a
  // matching icon, that's a gap to flag, not paper over by reusing one of
  // these for the wrong service.
  icon: string;
  shortDescription: string;
  fullDescription: string;
  deliverables: string[];
};

export const services: Service[] = [
  {
    slug: "web3-development",
    title: "Web3 Development",
    icon: "/icons/web3-dev.svg",
    shortDescription: "Smart contracts, dApps, and the infrastructure behind them.",
    fullDescription:
      "We build the technical layer of web3 products — smart contracts, dApp frontends, wallet integrations, and the infrastructure that keeps it all running. Shipped code, not whitepapers.",
    deliverables: [
      "Smart contract development",
      "dApp frontend & wallet integration",
      "Infrastructure & deployment",
    ],
  },
  {
    slug: "marketing",
    title: "Marketing",
    icon: "/icons/marketing.svg",
    shortDescription: "Positioning and campaigns for projects that need to be found.",
    fullDescription:
      "Marketing that's built around what you're actually shipping, not generic growth-hacking templates. Positioning, campaign strategy, and execution for teams that need to be found by the right people.",
    deliverables: ["Positioning & messaging", "Campaign strategy", "Launch execution"],
  },
  {
    slug: "social-media-management",
    title: "Social Media Management",
    icon: "/icons/social-media.svg",
    shortDescription: "Consistent presence and content, run by people who actually post.",
    fullDescription:
      "Day-to-day management of your social presence — content, scheduling, community replies — run by people who understand the space, not a generic agency playbook.",
    deliverables: ["Content calendar & posting", "Community engagement", "Performance tracking"],
  },
  {
    slug: "community-building",
    title: "Community Building",
    icon: "/icons/community.svg",
    shortDescription: "Turning an audience into a community that shows up.",
    fullDescription:
      "We've built our own community from zero — we apply the same approach to yours: real engagement over vanity metrics, structure that scales without losing what made it work early on.",
    deliverables: ["Community strategy & structure", "Moderation & engagement", "Growth planning"],
  },
];

// "Services they cover" on a team profile (SPEC.md Section 6) is meant to
// be derived from skill overlap, but skills are free-text — there's no
// shared taxonomy to join against. This is a small curated keyword map
// standing in for that until skills become structured data; a real
// tagging system would replace it outright, not extend it.
const SERVICE_SKILL_KEYWORDS: Record<string, string[]> = {
  "web3-development": ["solidity", "rust", "smart contract", "dapp", "blockchain", "web3", "node.js", "postgres", "backend"],
  marketing: ["strategy", "campaign", "marketing", "positioning", "growth"],
  "social-media-management": ["content", "scheduling", "social"],
  "community-building": ["moderation", "discord", "community", "partnerships", "ops"],
};

export function servicesForSkills(skills: string[]): Service[] {
  const lowerSkills = skills.map((s) => s.toLowerCase());
  return services.filter((service) => {
    const keywords = SERVICE_SKILL_KEYWORDS[service.slug] ?? [];
    return lowerSkills.some((skill) => keywords.some((kw) => skill.includes(kw) || kw.includes(skill)));
  });
}
