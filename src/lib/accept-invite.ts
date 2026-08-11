import { prisma } from "@/lib/prisma";

export async function getValidInvite(token: string) {
  const invite = await prisma.invite.findUnique({ where: { token } });

  if (!invite) return { invite: null, error: "This invite link is invalid." } as const;
  if (invite.usedAt) return { invite: null, error: "This invite has already been used." } as const;
  if (invite.revokedAt) return { invite: null, error: "This invite has been revoked." } as const;
  if (invite.expiresAt < new Date()) return { invite: null, error: "This invite has expired." } as const;

  return { invite, error: null } as const;
}
