import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

type AppleHealthTokenPayload = {
  purpose: "apple_health_ingest";
  tokenId: string;
  issuedAt: string;
};

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function issueAppleHealthApiKey(secret: string): string {
  const payload: AppleHealthTokenPayload = {
    purpose: "apple_health_ingest",
    tokenId: randomBytes(18).toString("base64url"),
    issuedAt: new Date().toISOString(),
  };
  const encoded = b64url(JSON.stringify(payload));
  return `lifeos_ah_${encoded}.${sign(secret, encoded)}`;
}

export function verifyAppleHealthApiKey(
  secret: string,
  apiKey: string,
): boolean {
  const token = apiKey.replace(/^lifeos_ah_/, "");
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;

  const expected = sign(secret, encoded);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return false;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<AppleHealthTokenPayload>;
    return payload.purpose === "apple_health_ingest" && !!payload.tokenId;
  } catch {
    return false;
  }
}
