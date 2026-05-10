import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { EncryptedTokens } from "@/lib/types/user";

function getKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

export function encryptJSON(secret: string, value: unknown): EncryptedTokens {
  const key = getKey(secret);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: Buffer.concat([enc, tag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptJSON<T = unknown>(
  secret: string,
  payload: EncryptedTokens,
): T {
  const key = getKey(secret);
  const iv = Buffer.from(payload.iv, "base64");
  const buf = Buffer.from(payload.ciphertext, "base64");
  const tag = buf.subarray(buf.length - 16);
  const enc = buf.subarray(0, buf.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return JSON.parse(dec.toString("utf8")) as T;
}
