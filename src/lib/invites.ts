import { randomBytes } from "crypto";

export const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function generateInviteToken() {
  return randomBytes(32).toString("base64url");
}

export function inviteExpiryDate() {
  return new Date(Date.now() + INVITE_TTL_MS);
}
