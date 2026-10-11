import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

/**
 * A salted, one-way hash of the requester's IP address, used only as a rate
 * limiting key for anonymous submissions. The raw IP is never stored or logged.
 */
export async function anonymousClientKey(scope: string): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || h.get("x-real-ip") || "unknown";
  const salt = process.env.RATE_LIMIT_SALT || "rakt-response-dev-salt";
  return createHash("sha256").update(`${salt}:${scope}:${ip}`).digest("hex").slice(0, 48);
}
