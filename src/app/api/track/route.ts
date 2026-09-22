import { NextResponse } from "next/server";
import {
  classifyReferrer,
  recordEvent,
  recordVisit,
  sessionCookieOptions,
  sessionFromRequest,
  touchLive,
} from "@/lib/analytics-store";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "/",
  "/maclar",
  "/etkinlikler",
  "/canli",
  "/bilgi",
  "/oyuncular",
  "/duyurular",
]);

function isBot(ua: string) {
  return /bot|crawler|spider|preview|facebookexternalhit|slackbot|whatsapp|telegram|discord|linkedinbot/i.test(
    ua,
  );
}

function normalizePath(raw: string) {
  const path = raw.split("?")[0].replace(/\/+$/, "") || "/";
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) return "/";
  return path.slice(0, 80);
}

export async function POST(request: Request) {
  if (isBot(request.headers.get("user-agent") || "")) {
    return NextResponse.json({ ok: true, skipped: "bot" });
  }

  const body = (await request.json().catch(() => ({}))) as {
    path?: string;
    locale?: string;
    referrer?: string;
    ping?: boolean;
    event?: string;
  };
  const path = typeof body.path === "string" ? normalizePath(body.path) : "/";
  const locale = body.locale === "en" ? "en" : "tr";
  const hadSession = /(?:^|;\s*)ao_sid=/.test(request.headers.get("cookie") || "");
  const session = sessionFromRequest(request);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const referrer = classifyReferrer(typeof body.referrer === "string" ? body.referrer : "", host);
  const now = Date.now();

  if (body.event === "ticket") {
    await recordEvent({ t: now, k: "ticket", s: session, p: path, l: locale });
  } else if (body.ping) {
    if (ALLOWED.has(path)) {
      touchLive({ s: session, t: now, p: path, l: locale, r: referrer });
    }
  } else if (ALLOWED.has(path)) {
    await recordVisit({ t: now, p: path, l: locale, s: session, r: referrer });
  }

  const res = NextResponse.json({ ok: true });
  if (!hadSession) {
    res.cookies.set("ao_sid", session, sessionCookieOptions());
  }
  return res;
}
