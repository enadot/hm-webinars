// Uses Web Crypto API so this module works in both Node.js and Edge runtimes.

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET env var is not set");
  return secret;
}

const encoder = new TextEncoder();

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) return new Uint8Array(0);
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function sign(payload: string): Promise<string> {
  const key = await importKey(getSecret());
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return bytesToHex(sig);
}

export async function createSessionCookie(): Promise<{ value: string; maxAge: number }> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const sig = await sign(payload);
  return {
    value: `${payload}.${sig}`,
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

export async function verifySessionCookie(cookie: string | undefined): Promise<boolean> {
  if (!cookie) return false;
  const [payload, sig] = cookie.split(".");
  if (!payload || !sig) return false;
  let expected: string;
  try {
    expected = await sign(payload);
  } catch {
    return false;
  }
  if (!constantTimeEqual(hexToBytes(expected), hexToBytes(sig))) return false;
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt)) return false;
  return expiresAt > Date.now();
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Always compare a fixed-length byte sequence to avoid timing leaks from length differences
  const a = encoder.encode(input);
  const b = encoder.encode(expected);
  if (a.length !== b.length) {
    // run a dummy comparison of equal-size buffers to keep timing similar
    constantTimeEqual(b, b);
    return false;
  }
  return constantTimeEqual(a, b);
}
