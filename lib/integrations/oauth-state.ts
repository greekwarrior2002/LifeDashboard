import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const OAUTH_STATE_COOKIE_PREFIX = "lifeos_oauth_state_";

function sign(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createStateToken(secret: string): string {
  const nonce = randomBytes(16).toString("base64url");
  const sig = sign(secret, nonce);
  return `${nonce}.${sig}`;
}

export function verifyStateToken(secret: string, token: string | undefined): boolean {
  if (!token) return false;
  const [nonce, sig] = token.split(".");
  if (!nonce || !sig) return false;
  const expected = sign(secret, nonce);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
