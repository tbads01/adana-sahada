import { NextResponse } from "next/server";
import { recordVisit, sessionCookieOptions, sessionFromRequest } from "@/lib/analytics-store";

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

export async function POST(request: Request) {
  if (isBot(request.headers.get("user-agent") || "")) {
    return NextResponse.json({ ok: true, skipped: "bot" });
  }

  const body = (await request.json().catch(() => ({}))) as { path?: string; locale?: string };
  const path = typeof body.path === "string" ? body.path.split("?")[0].replace(/\/+$/, "") || "/" : "";
  if (!ALLOWED.has(path)) {
    return NextResponse.json({ ok: true, skipped: "path" });
  }

  const locale = body.locale === "en" ? "en" : "tr";
  const hadSession = /(?:^|;\s*)ao_sid=/.test(request.headers.get("cookie") || "");
  const session = sessionFromRequest(request);

  await recordVisit({ t: Date.now(), p: path, l: locale, s: session });

  const res = NextResponse.json({ ok: true });
  if (!hadSession) {
    res.cookies.set("ao_sid", session, sessionCookieOptions());
  }
  return res;
}
