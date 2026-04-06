export type AdminSession = {
  role: "admin";
  email: string;
};

const ADMIN_COOKIE_NAME = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSecureCookieSuffix(): string {
  return process?.env?.NODE_ENV === "production" ? "; Secure" : "";
}

function getSecret(): string {
  return process?.env?.AUTH_SECRET || "dev-only-change-me";
}

function encodeBase64Url(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value).toString("base64url");
  }
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(value)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "base64url").toString("utf8");
  }
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function decodeBase64UrlBytes(value: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64url"));
  }
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function getHmacKey(): Promise<CryptoKey> {
  const secret = getSecret();
  const bytes =
    typeof Buffer !== "undefined"
      ? Buffer.from(secret)
      : new TextEncoder().encode(secret);
  return crypto.subtle.importKey(
    "raw",
    bytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signValue(payload: string): Promise<string> {
  const key = await getHmacKey();
  const data =
    typeof Buffer !== "undefined"
      ? Buffer.from(payload)
      : new TextEncoder().encode(payload);
  const signature = await crypto.subtle.sign("HMAC", key, data);
  const bytes = new Uint8Array(signature);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }
  const b64 = btoa(String.fromCharCode(...bytes));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function timingSafeEqualBase64Url(left: string, right: string): Promise<boolean> {
  const leftBytes = decodeBase64UrlBytes(left);
  const rightBytes = decodeBase64UrlBytes(right);
  if (leftBytes.length !== rightBytes.length) return false;
  let diff = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    diff |= leftBytes[index] ^ rightBytes[index];
  }
  return diff === 0;
}

async function encodeSession(payload: Record<string, unknown>): Promise<string> {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

async function decodeSession(token: string | undefined | null): Promise<Record<string, unknown> | null> {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature) return null;
  const expectedSignature = await signValue(payload);
  if (!(await timingSafeEqualBase64Url(signature, expectedSignature))) return null;

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as {
      exp?: unknown;
    };
    const expiration = typeof parsed.exp === "number" ? parsed.exp : Number.NaN;
    if (!Number.isFinite(expiration) || Date.now() > expiration) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function safeEqualStrings(left: string, right: string): Promise<boolean> {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  if (leftBytes.length !== rightBytes.length) return false;
  let diff = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    diff |= leftBytes[index] ^ rightBytes[index];
  }
  return diff === 0;
}

function parseCsvEnv(value: string | undefined): string[] {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getAdminCredentialPairs(): Array<{ email: string; password: string }> {
  const usernames = parseCsvEnv(process.env.ADMIN_USERNAME);
  const passwords = parseCsvEnv(process.env.ADMIN_PASSWORD);
  if (
    usernames.length > 0 &&
    passwords.length > 0 &&
    usernames.length === passwords.length
  ) {
    return usernames.map((email, index) => ({
      email: email.trim().toLowerCase(),
      password: passwords[index],
    }));
  }

  const emails = parseCsvEnv(process.env.ADMIN_EMAILS);
  const emailPasswords = parseCsvEnv(process.env.ADMIN_PASSWORDS);
  if (
    emails.length > 0 &&
    emailPasswords.length > 0 &&
    emails.length === emailPasswords.length
  ) {
    return emails.map((email, index) => ({
      email: email.trim().toLowerCase(),
      password: emailPasswords[index],
    }));
  }

  return [];
}

function getCookieValue(cookieHeader: string, cookieName: string): string | undefined {
  const prefix = `${cookieName}=`;
  return cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix))
    ?.slice(prefix.length);
}

export function isAdminCredentialsConfigured(): boolean {
  return getAdminCredentialPairs().length > 0;
}

export async function validateAdminCredentials(email: string, password: string): Promise<boolean> {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const providedPassword = String(password || "");
  const credentials = getAdminCredentialPairs();
  if (credentials.length === 0) return false;
  for (const credential of credentials) {
    if (
      (await safeEqualStrings(normalizedEmail, credential.email)) &&
      (await safeEqualStrings(providedPassword, credential.password))
    ) {
      return true;
    }
  }
  return false;
}

export async function createAdminSessionToken(email: string): Promise<string> {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return encodeSession({
    role: "admin",
    email: normalizedEmail,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
}

export function createAdminSessionCookie(token: string): string {
  return `${ADMIN_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Lax${getSecureCookieSuffix()}`;
}

export function clearAdminSessionCookie(): string {
  return `${ADMIN_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${getSecureCookieSuffix()}`;
}

export async function getAdminSessionFromCookieHeader(cookieHeader: string): Promise<AdminSession | null> {
  if (typeof cookieHeader !== "string" || !cookieHeader.trim()) return null;
  const token = getCookieValue(cookieHeader, ADMIN_COOKIE_NAME);
  const session = await decodeSession(token);
  if (!session || session.role !== "admin") return null;
  const email = String(session.email || "").trim().toLowerCase();
  return { role: "admin", email };
}
