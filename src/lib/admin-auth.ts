import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "ao_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 14;

export function adminSecret() {
  return process.env.PUSH_ADMIN_SECRET || (process.env.NODE_ENV !== "production" ? "dev" : "");
}

export function signAdminToken() {
  const exp = String(Date.now() + ADMIN_MAX_AGE * 1000);
  const sig = createHmac("sha256", adminSecret()).update(exp).digest("hex");
  return `${exp}.${sig}`;
}

export function verifyAdminToken(token: string | undefined) {
  if (!token || !adminSecret()) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!sig || Number(exp) < Date.now()) return false;
  const expected = createHmac("sha256", adminSecret()).update(exp).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function adminTokenFromRequest(request: Request) {
  const raw = request.headers.get("cookie") || "";
  const match = raw.match(/(?:^|;\s*)ao_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export function isAdminRequest(request: Request) {
  return verifyAdminToken(adminTokenFromRequest(request));
}

export function adminPageUrl(request: Request, query = "") {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (host?.includes("localhost") || host?.startsWith("127.") ? "http" : "https");
  const origin = host ? `${proto}://${host}` : new URL(request.url).origin;
  return new URL(`/admin${query}`, origin);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  };
}
