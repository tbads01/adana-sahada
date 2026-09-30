import { GUIDE_TZ } from "./guide";

export const CONTEST_CLOSE_ISO = "2026-10-04T10:00:00+03:00";
export const CONTEST_CLOSE_MS = Date.parse(CONTEST_CLOSE_ISO);
export const CONTEST_PATH = "/tahmin";

export type ContestGuesses = {
  aces: number;
  totalMinutes: number;
  finalMinutes: number;
};

export type ContestConsentStamp = {
  at: string;
  version: string;
  hash?: string;
};

export type ContestConsents = {
  kvkk: ContestConsentStamp;
  riza: ContestConsentStamp;
  rules: ContestConsentStamp;
  marketing: ContestConsentStamp | null;
};

export type ContestLegalDoc = {
  version: string;
  updatedAt: string;
  kvkk: { tr: string; en: string };
  riza: { tr: string; en: string };
  rules: { tr: string; en: string };
  draw: { tr: string; en: string };
  marketing: { tr: string; en: string };
  retention: { tr: string; en: string };
};

export type ContestEntryPublic = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  guesses: ContestGuesses;
  consents: ContestConsents;
  createdAt: string;
  marketing: boolean;
};

export function contestOpen(now = Date.now()) {
  return now < CONTEST_CLOSE_MS;
}

export function istanbulStamp(now = Date.now()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: GUIDE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .format(now)
    .replace(" ", "T");
}

export function normalizeTrMobile(raw: string) {
  const digits = raw.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("90") && local.length === 12) local = local.slice(2);
  if (local.startsWith("0") && local.length === 11) local = local.slice(1);
  if (local.length !== 10 || !local.startsWith("5")) return null;
  return `+90${local}`;
}

export function displayTrMobile(e164: string) {
  const local = e164.replace(/^\+90/, "");
  if (local.length !== 10) return e164;
  return `0${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 8)} ${local.slice(8)}`;
}

export function parsePositiveInt(raw: unknown) {
  if (typeof raw === "number" && Number.isInteger(raw) && raw > 0 && raw <= 1_000_000) return raw;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!/^[1-9]\d{0,6}$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isInteger(value) || value < 1 || value > 1_000_000) return null;
  return value;
}

export function remainingToClose(now = Date.now()) {
  const ms = Math.max(0, CONTEST_CLOSE_MS - now);
  const total = Math.floor(ms / 1000);
  return {
    open: ms > 0,
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}
