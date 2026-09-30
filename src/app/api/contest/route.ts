import { NextResponse } from "next/server";
import { contestOpen, CONTEST_CLOSE_ISO, parsePositiveInt } from "@/lib/contest";
import { loadLegal, saveEntry } from "@/lib/contest-store";

export const dynamic = "force-dynamic";

const hits = new Map<string, number[]>();

function clientIp(request: Request) {
  const fwd = request.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function limited(ip: string) {
  const now = Date.now();
  const windowMs = 10 * 60_000;
  const list = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= 8) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  return false;
}

export async function GET() {
  const legal = await loadLegal();
  return NextResponse.json({
    open: contestOpen(),
    closesAt: CONTEST_CLOSE_ISO,
    version: legal.version,
    legal,
  });
}

export async function POST(request: Request) {
  if (!contestOpen()) {
    return NextResponse.json({ ok: false, error: "closed" }, { status: 403 });
  }
  const ip = clientIp(request);
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "limit" }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as {
    firstName?: unknown;
    lastName?: unknown;
    phone?: unknown;
    aces?: unknown;
    totalMinutes?: unknown;
    finalMinutes?: unknown;
    kvkk?: unknown;
    riza?: unknown;
    rules?: unknown;
    marketing?: unknown;
  } | null;

  if (!body) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  if (body.kvkk !== true || body.riza !== true || body.rules !== true) {
    return NextResponse.json({ ok: false, error: "consent" }, { status: 400 });
  }

  const aces = parsePositiveInt(body.aces);
  const totalMinutes = parsePositiveInt(body.totalMinutes);
  const finalMinutes = parsePositiveInt(body.finalMinutes);
  if (aces == null || totalMinutes == null || finalMinutes == null) {
    return NextResponse.json({ ok: false, error: "guess" }, { status: 400 });
  }

  const result = await saveEntry({
    firstName: typeof body.firstName === "string" ? body.firstName : "",
    lastName: typeof body.lastName === "string" ? body.lastName : "",
    phone: typeof body.phone === "string" ? body.phone : "",
    guesses: { aces, totalMinutes, finalMinutes },
    marketing: body.marketing === true,
  });

  if (!result.ok) {
    const status = result.error === "duplicate" ? 409 : result.error === "closed" ? 403 : 400;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }
  return NextResponse.json({ ok: true });
}
