/**
 * Sesi sederhana berbasis cookie yang ditandatangani HMAC-SHA256.
 * Memakai Web Crypto supaya bisa dipakai di middleware (edge runtime)
 * maupun di route handler (node runtime).
 */

export const SESSION_COOKIE = "wcs_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 jam

const encoder = new TextEncoder();

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error("AUTH_SECRET wajib diisi minimal 16 karakter.");
  }
  return value;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toBase64Url(new Uint8Array(signature));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Membuat token sesi baru yang berlaku 12 jam. */
export async function createSessionToken(): Promise<string> {
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  const signature = await hmac(expiresAt);
  return `${expiresAt}.${signature}`;
}

/** Memeriksa token sesi: tanda tangan benar dan belum kedaluwarsa. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;

  const expiresAt = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < Date.now()) return false;

  const expected = await hmac(expiresAt);
  return timingSafeEqual(signature, expected);
}

export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
