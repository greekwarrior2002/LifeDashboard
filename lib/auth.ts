// Tiny single-user auth: HMAC-signed expiring cookie.
// Runs on the edge (Web Crypto only — no Node imports).

const COOKIE_NAME = "lifeos_session";
const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type SessionPayload = {
  exp: number;
  onboarded: boolean;
};

function b64url(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  let t = s.replace(/-/g, "+").replace(/_/g, "/");
  while (t.length % 4) t += "=";
  const bin = atob(t);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signSession(
  secret: string,
  options: { onboarded?: boolean; ttlSeconds?: number } = {},
): Promise<string> {
  const ttl = options.ttlSeconds ?? TTL_SECONDS;
  const payload: SessionPayload = {
    exp: Math.floor(Date.now() / 1000) + ttl,
    onboarded: options.onboarded ?? false,
  };
  const encoded = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encoded),
  );
  return `${encoded}.${b64url(sig)}`;
}

export async function verifySession(
  secret: string,
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const key = await getKey(secret);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      fromB64url(sig),
      new TextEncoder().encode(payload),
    );
    if (!ok) return null;
    const decoded = new TextDecoder().decode(fromB64url(payload));
    // Backwards compat: original tokens stored just the exp number.
    let parsed: SessionPayload;
    try {
      const obj = JSON.parse(decoded);
      if (typeof obj === "number") {
        parsed = { exp: obj, onboarded: false };
      } else {
        parsed = {
          exp: Number(obj.exp),
          onboarded: !!obj.onboarded,
        };
      }
    } catch {
      const exp = Number(decoded);
      if (!Number.isFinite(exp)) return null;
      parsed = { exp, onboarded: false };
    }
    if (!Number.isFinite(parsed.exp) || parsed.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_TTL = TTL_SECONDS;
