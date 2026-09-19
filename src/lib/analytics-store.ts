import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { istanbulIsoDate } from "./guide";
import { persistFile } from "./persist";

export const SESSION_COOKIE = "ao_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 180;
const VISIT_CAP = 25_000;
const DEDUPE_MS = 15_000;
const DAY_KEEP = 45;

export type Visit = {
  t: number;
  p: string;
  l: "tr" | "en";
  s: string;
};

export type SendLog = {
  t: number;
  title: string;
  sent: number;
  total: number;
};

export type DayBucket = {
  views: number;
  unique: number;
  pages: Record<string, number>;
  locales: { tr: number; en: number };
  hours: number[];
  sids: string[];
};

export type AnalyticsStore = {
  visits: Visit[];
  days: Record<string, DayBucket>;
  sends: SendLog[];
  notify: { lastAt: number | null };
};

const emptyStore = (): AnalyticsStore => ({
  visits: [],
  days: {},
  sends: [],
  notify: { lastAt: null },
});

let chain = Promise.resolve();

function withLock<T>(fn: () => Promise<T>) {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function storePath() {
  return persistFile("analytics.json");
}

async function readStore(): Promise<AnalyticsStore> {
  try {
    const raw = await readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<AnalyticsStore>;
    return {
      visits: Array.isArray(parsed.visits) ? parsed.visits : [],
      days: parsed.days && typeof parsed.days === "object" ? parsed.days : {},
      sends: Array.isArray(parsed.sends) ? parsed.sends : [],
      notify: parsed.notify ?? { lastAt: null },
    };
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: AnalyticsStore) {
  const file = storePath();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(store));
}

function prune(store: AnalyticsStore, now = Date.now()) {
  if (store.visits.length > VISIT_CAP) {
    store.visits = store.visits.slice(-Math.floor(VISIT_CAP * 0.8));
  }
  if (store.sends.length > 200) store.sends = store.sends.slice(-120);

  const cutoff = istanbulIsoDate(now - DAY_KEEP * 86_400_000);
  for (const iso of Object.keys(store.days)) {
    if (iso < cutoff) delete store.days[iso];
  }

  const today = istanbulIsoDate(now);
  for (const [iso, day] of Object.entries(store.days)) {
    if (!day.hours || day.hours.length !== 24) {
      day.hours = Array.from({ length: 24 }, (_, i) => day.hours?.[i] ?? 0);
    }
    if (iso < today && day.sids?.length) day.sids = [];
  }
}

function istanbulHour(now: number) {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(now);
  return Number(hour);
}

export async function loadAnalytics() {
  return withLock(readStore);
}

export async function recordVisit(visit: Visit) {
  return withLock(async () => {
    const store = await readStore();
    const last = [...store.visits].reverse().find((item) => item.s === visit.s && item.p === visit.p);
    if (last && visit.t - last.t < DEDUPE_MS) return store;

    store.visits.push(visit);
    const iso = istanbulIsoDate(visit.t);
    const day = store.days[iso] ?? {
      views: 0,
      unique: 0,
      pages: {},
      locales: { tr: 0, en: 0 },
      hours: Array.from({ length: 24 }, () => 0),
      sids: [],
    };
    day.views += 1;
    day.pages[visit.p] = (day.pages[visit.p] ?? 0) + 1;
    day.locales[visit.l] += 1;
    day.hours[istanbulHour(visit.t)] += 1;
    if (!day.sids.includes(visit.s)) {
      day.sids.push(visit.s);
      day.unique += 1;
      if (day.sids.length > 8_000) day.sids = day.sids.slice(-4_000);
    }
    store.days[iso] = day;
    prune(store, visit.t);
    await writeStore(store);
    return store;
  });
}

export async function recordSend(entry: SendLog) {
  return withLock(async () => {
    const store = await readStore();
    store.sends.push(entry);
    prune(store, entry.t);
    await writeStore(store);
    return store;
  });
}

export async function recordNotify() {
  return withLock(async () => {
    const store = await readStore();
    store.notify.lastAt = Date.now();
    await writeStore(store);
    return store;
  });
}

export function newSessionId() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function sessionFromRequest(request: Request) {
  const raw = request.headers.get("cookie") || "";
  const match = raw.match(/(?:^|;\s*)ao_sid=([^;]+)/);
  const existing = match ? decodeURIComponent(match[1]).replace(/[^a-z0-9]/gi, "").slice(0, 32) : "";
  return existing.length >= 8 ? existing : newSessionId();
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  };
}
