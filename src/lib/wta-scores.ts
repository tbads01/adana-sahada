import type { CourtId, MatchRound } from "./match-plan";

export const WTA_MATCHES_URL = "https://api.wtatennis.com/tennis/tournaments/1179/2026/matches";
export const WTA_OOP_URL = "https://api.wtatennis.com/tennis/tournaments/1179/2026/oop";

export type WtaState = "live" | "complete" | "scheduled" | "cancelled";

export type WtaSide = {
  name: string;
  last: string;
  lastKey: string;
  country: string;
  seed?: string;
  wc?: boolean;
};

export type WtaScore = {
  id: string;
  courtId: CourtId | null;
  state: WtaState;
  iso: string | null;
  round: MatchRound;
  start?: string;
  notBefore?: boolean;
  followed?: boolean;
  seq: number;
  a: WtaSide;
  b: WtaSide;
  sets: [string, string][];
  points?: [string, string];
  serving?: "a" | "b";
  winner?: "a" | "b";
  scoreLine: string;
  retired: boolean;
};

export type WtaCourtDay = {
  courtId: CourtId;
  start: string;
  matches: WtaScore[];
};

export type WtaDay = {
  iso: string;
  start: string;
  courts: WtaCourtDay[];
};

export type WtaBoard = {
  updatedAt: string | null;
  matches: WtaScore[];
  days: WtaDay[];
};

const COURT_ID: Record<number, CourtId> = { 1: "cc", 2: "c2", 3: "c1" };
const COURT_ORDER: CourtId[] = ["cc", "c1", "c2"];
const HEADERS = {
  Accept: "application/json",
  "User-Agent": "AdanaOpen/1.0 (m.adanaopen.com)",
};

const TTL_MS = 15_000;
let cache: { at: number; data: WtaBoard } | null = null;

type RawMatch = {
  MatchID?: string;
  CourtID?: number | null;
  MatchState?: string | null;
  MatchTimeStamp?: string | null;
  DrawLevelType?: string | null;
  DrawMatchType?: string | null;
  RoundID?: string | number | null;
  EntryTypeA?: string | null;
  EntryTypeB?: string | null;
  PlayerNameFirstA?: string | null;
  PlayerNameLastA?: string | null;
  PlayerNameFirstA2?: string | null;
  PlayerNameLastA2?: string | null;
  PlayerNameFirstB?: string | null;
  PlayerNameLastB?: string | null;
  PlayerNameFirstB2?: string | null;
  PlayerNameLastB2?: string | null;
  PlayerCountryA?: string | null;
  PlayerCountryB?: string | null;
  SeedA?: string | null;
  SeedB?: string | null;
  ScoreSet1A?: string | null;
  ScoreSet1B?: string | null;
  ScoreSet2A?: string | null;
  ScoreSet2B?: string | null;
  ScoreSet3A?: string | null;
  ScoreSet3B?: string | null;
  ScoreSet4A?: string | null;
  ScoreSet4B?: string | null;
  ScoreSet5A?: string | null;
  ScoreSet5B?: string | null;
  ScoreTbSet1?: string | null;
  ScoreTbSet2?: string | null;
  ScoreTbSet3?: string | null;
  ScoreTbSet4?: string | null;
  ScoreTbSet5?: string | null;
  ScoreString?: string | null;
  ResultString?: string | null;
  PointA?: string | null;
  PointB?: string | null;
  Serve?: string | null;
  Winner?: string | null;
};

type OopPlayer = {
  FirstName?: string;
  SurName?: string;
  Country?: string;
};

type OopPlayerWrap = {
  plyrTeam?: number;
  EntryType?: string;
  Seed?: string | number;
  Player?: OopPlayer | OopPlayer[];
};

type OopMatch = {
  MatchId?: string;
  Status?: string;
  seq?: number;
  RoundId?: string | number;
  NotBefore?: string;
  NotBeforeText?: string;
  NotBeforeISOTime?: string;
  Players?: OopPlayerWrap[] | OopPlayerWrap;
};

type OopCourt = {
  CourtName?: string;
  Matches?: { Match?: OopMatch | OopMatch[] };
};

type OopDay = {
  ISODate?: string;
  Seq?: number;
  Court?: OopCourt | OopCourt[];
};

function asList<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function foldName(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

export function lastKey(name: string) {
  const parts = name.trim().split(/\s+/);
  return foldName(parts[parts.length - 1] ?? name);
}

function near(a: string, b: string) {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  if (Math.abs(a.length - b.length) > 2) return false;
  return levenshtein(a, b) <= 2;
}

function levenshtein(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const grid = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i += 1) grid[i][0] = i;
  for (let j = 0; j < cols; j += 1) grid[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      grid[i][j] = Math.min(grid[i - 1][j] + 1, grid[i][j - 1] + 1, grid[i - 1][j - 1] + cost);
    }
  }
  return grid[a.length][b.length];
}

function istanbulIso(stamp?: string | null) {
  if (!stamp) return null;
  const date = new Date(stamp);
  if (Number.isNaN(date.getTime())) {
    const m = stamp.match(/^(\d{4}-\d{2}-\d{2})/);
    return m?.[1] ?? null;
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) return null;
  return `${year}-${month}-${day}`;
}

function hhmm(value?: string | null) {
  const m = (value ?? "").match(/(\d{1,2}):(\d{2})/);
  if (!m) return undefined;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

function mapCourtName(name?: string | null): CourtId | null {
  const key = foldName(name ?? "");
  if (!key) return null;
  if (key.includes("centre") || key.includes("center") || key.includes("merkez")) return "cc";
  if (key.includes("ipek")) return "c2";
  if (key.includes("cagla")) return "c1";
  if (key.includes("courta") || key.endsWith("courta")) return "c1";
  if (key.includes("courtb") || key.endsWith("courtb")) return "c2";
  return null;
}

function mapRound(level?: string | null, roundId?: string | number | null, matchType?: string | null): MatchRound {
  const id = String(roundId ?? "").trim();
  const lvl = (level ?? "").toUpperCase();
  const kind = (matchType ?? "S").toUpperCase();
  if (lvl === "Q" || id === "11") {
    if (id === "10") return "QSF";
    return "QS1";
  }
  if (kind === "D") {
    if (id === "5" || id === "1" && lvl === "F") return "MDF";
    if (id === "4") return "MDSF";
    if (id === "3" || id === "8") return "MDQF";
    return "MD1";
  }
  if (id === "10") return "QSF";
  if (id === "11") return "QS1";
  if (id === "5") return "MSF";
  if (id === "4") return "MSSF";
  if (id === "3" || id === "8") return "MSQF";
  if (id === "2" || id === "16") return "MS2";
  return "MS1";
}

function isWc(value?: string | null) {
  return /^w\.?c\.?$/i.test((value ?? "").trim());
}

function pairName(first?: string | null, last?: string | null, first2?: string | null, last2?: string | null) {
  const one = `${(first ?? "").trim()} ${(last ?? "").trim()}`.trim();
  const two = `${(first2 ?? "").trim()} ${(last2 ?? "").trim()}`.trim();
  if (one && two) return `${one} / ${two}`;
  return one || two;
}

function sideFromParts(
  first?: string | null,
  last?: string | null,
  country?: string | null,
  seed?: string | number | null,
  entry?: string | null,
  first2?: string | null,
  last2?: string | null,
): WtaSide {
  const lastName = (last ?? "").trim() || (last2 ?? "").trim();
  const name = pairName(first, last, first2, last2);
  const seedText = seed == null ? "" : String(seed).trim();
  return {
    name,
    last: lastName,
    lastKey: foldName(lastName),
    country: (country ?? "").trim(),
    seed: seedText && seedText !== "0" ? seedText : undefined,
    wc: isWc(entry) || undefined,
  };
}

function oopTeam(items: OopPlayerWrap[], team: number): WtaSide {
  const members = items.filter((item) => Number(item.plyrTeam) === team);
  const people = members.flatMap((item) => asList(item.Player));
  const first = people[0];
  const second = people[1];
  const meta = members[0];
  return sideFromParts(
    first?.FirstName,
    first?.SurName,
    first?.Country,
    meta?.Seed,
    meta?.EntryType,
    second?.FirstName,
    second?.SurName,
  );
}

function prettyLine(raw: string) {
  return raw
    .replace(/\s*Ret'?d\.?/gi, "")
    .replace(/,/g, "  ")
    .replace(/(\d)-(\d)/g, "$1–$2")
    .trim();
}

function attachTb(gamesA: string, gamesB: string, tie?: string | null): [string, string] {
  const a = gamesA.trim();
  const b = gamesB.trim();
  const t = (tie ?? "").trim();
  if (!t) return [a, b];
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb) && nb > na) return [a, `${b}(${t})`];
  return [`${a}(${t})`, b];
}

function setsOf(raw: RawMatch): [string, string][] {
  const rows: [string, string, string | null | undefined][] = [
    [raw.ScoreSet1A ?? "", raw.ScoreSet1B ?? "", raw.ScoreTbSet1],
    [raw.ScoreSet2A ?? "", raw.ScoreSet2B ?? "", raw.ScoreTbSet2],
    [raw.ScoreSet3A ?? "", raw.ScoreSet3B ?? "", raw.ScoreTbSet3],
    [raw.ScoreSet4A ?? "", raw.ScoreSet4B ?? "", raw.ScoreTbSet4],
    [raw.ScoreSet5A ?? "", raw.ScoreSet5B ?? "", raw.ScoreTbSet5],
  ];
  return rows
    .filter(([a, b]) => a.trim() !== "" && b.trim() !== "")
    .map(([a, b, tie]) => attachTb(a, b, tie));
}

function mapState(raw: RawMatch, sets: [string, string][]): WtaState {
  const state = (raw.MatchState ?? "").toUpperCase();
  if (state === "F") return "complete";
  if (state === "C") return "cancelled";
  if (state === "U" || state === "") {
    if (sets.length || (raw.PointA && raw.PointA !== "")) return "live";
    return "scheduled";
  }
  if (["P", "I", "L", "IP"].includes(state)) return "live";
  if (sets.length && state !== "C") return "live";
  return "scheduled";
}

function mapOopState(status?: string | null): WtaState | null {
  const s = (status ?? "").toLowerCase();
  if (!s) return null;
  if (s.includes("progress") || s === "playing" || s === "live") return "live";
  if (s.includes("cancel") || s.includes("walkover") || s === "wo") return "cancelled";
  if (s.includes("complete") || s.includes("retired")) return "complete";
  return null;
}

function mapWinner(raw: RawMatch): "a" | "b" | undefined {
  const w = raw.Winner;
  if (w === "2" || w === "4") return "a";
  if (w === "3" || w === "5") return "b";
  return undefined;
}

function mapServe(raw: RawMatch): "a" | "b" | undefined {
  if (raw.Serve === "2") return "a";
  if (raw.Serve === "3") return "b";
  return undefined;
}

function emptyScore(id: string, round: MatchRound, a: WtaSide, b: WtaSide): WtaScore {
  return {
    id,
    courtId: null,
    state: "scheduled",
    iso: null,
    round,
    seq: 0,
    a,
    b,
    sets: [],
    scoreLine: "",
    retired: false,
  };
}

function normalizeMatch(raw: RawMatch): WtaScore | null {
  const a = sideFromParts(
    raw.PlayerNameFirstA,
    raw.PlayerNameLastA,
    raw.PlayerCountryA,
    raw.SeedA,
    raw.EntryTypeA,
    raw.PlayerNameFirstA2,
    raw.PlayerNameLastA2,
  );
  const b = sideFromParts(
    raw.PlayerNameFirstB,
    raw.PlayerNameLastB,
    raw.PlayerCountryB,
    raw.SeedB,
    raw.EntryTypeB,
    raw.PlayerNameFirstB2,
    raw.PlayerNameLastB2,
  );
  if (!a.last && !b.last) return null;
  const sets = setsOf(raw);
  const retired = /ret/i.test(raw.ScoreString ?? "") || /ret/i.test(raw.ResultString ?? "");
  const scoreLine =
    prettyLine((raw.ScoreString ?? "").trim()) || sets.map(([x, y]) => `${x}–${y}`).join("  ");
  const pa = (raw.PointA ?? "").trim();
  const pb = (raw.PointB ?? "").trim();
  const stamp = raw.MatchTimeStamp;
  const start = hhmm(stamp);
  const placeholder = start === "23:59";
  return {
    id: raw.MatchID ?? `${a.last}-${b.last}`,
    courtId: raw.CourtID != null ? (COURT_ID[raw.CourtID] ?? null) : null,
    state: mapState(raw, sets),
    iso: istanbulIso(stamp),
    round: mapRound(raw.DrawLevelType, raw.RoundID, raw.DrawMatchType),
    start: placeholder ? undefined : start,
    seq: 0,
    a,
    b,
    sets,
    points: pa || pb ? [pa, pb] : undefined,
    serving: mapServe(raw),
    winner: mapWinner(raw),
    scoreLine,
    retired,
  };
}

function preferSide(primary: WtaSide, fallback: WtaSide): WtaSide {
  if (primary.last) {
    return {
      ...primary,
      seed: primary.seed || fallback.seed,
      wc: primary.wc || fallback.wc,
      country: primary.country || fallback.country,
      name: primary.name || fallback.name,
    };
  }
  return fallback;
}

function mergeRow(score: WtaScore, oop: WtaScore): WtaScore {
  return {
    ...score,
    courtId: oop.courtId ?? score.courtId,
    iso: oop.iso ?? score.iso,
    start: oop.followed ? oop.start : oop.start || score.start,
    notBefore: oop.notBefore ?? score.notBefore,
    followed: oop.followed ?? score.followed,
    seq: oop.seq || score.seq,
    round: score.round || oop.round,
    a: preferSide(score.a, oop.a),
    b: preferSide(score.b, oop.b),
  };
}

function parseOop(json: unknown): OopDay[] {
  const root = json as { orderOfPlay?: unknown };
  const raw = asList(root.orderOfPlay)[0];
  if (!raw) return [];
  const parsed = typeof raw === "string" ? (JSON.parse(raw) as { OOP?: { Schedule?: { Day?: OopDay | OopDay[] } } }) : (raw as { OOP?: { Schedule?: { Day?: OopDay | OopDay[] } } });
  return asList(parsed.OOP?.Schedule?.Day);
}

function fromOopMatch(raw: OopMatch, iso: string, courtId: CourtId | null): WtaScore | null {
  const players = asList(raw.Players);
  const a = oopTeam(players, 1);
  const b = oopTeam(players, 2);
  if (!a.last && !b.last) {
    const loose = players.flatMap((item) => asList(item.Player));
    if (loose.length < 2) return null;
  }
  const note = `${raw.NotBefore ?? ""} ${raw.NotBeforeText ?? ""}`;
  const followed = /followed/i.test(note);
  const notBefore = /not before/i.test(note);
  const start = hhmm(raw.NotBeforeISOTime) || (followed ? undefined : hhmm(raw.NotBefore));
  const id = raw.MatchId || `${a.last}-${b.last}`;
  const oopState = mapOopState(raw.Status);
  const row = emptyScore(id, mapRound("Q", raw.RoundId, "S"), a.last ? a : oopTeam(players, 1), b.last ? b : oopTeam(players, 2));
  row.courtId = courtId;
  row.iso = iso;
  row.start = start;
  row.notBefore = notBefore || undefined;
  row.followed = followed || undefined;
  row.seq = Number(raw.seq) || 0;
  if (oopState) row.state = oopState;
  return row;
}

function sortCourts(courts: WtaCourtDay[]) {
  return [...courts].sort((a, b) => COURT_ORDER.indexOf(a.courtId) - COURT_ORDER.indexOf(b.courtId));
}

function buildDays(rows: WtaScore[]): WtaDay[] {
  const byIso = new Map<string, WtaScore[]>();
  for (const row of rows) {
    if (!row.iso) continue;
    const list = byIso.get(row.iso) ?? [];
    list.push(row);
    byIso.set(row.iso, list);
  }
  return [...byIso.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([iso, matches]) => {
      const byCourt = new Map<CourtId, WtaScore[]>();
      for (const row of matches) {
        const courtId = row.courtId ?? "cc";
        const list = byCourt.get(courtId) ?? [];
        list.push(row);
        byCourt.set(courtId, list);
      }
      const courts = sortCourts(
        [...byCourt.entries()].map(([courtId, courtMatches]) => {
          const ordered = [...courtMatches].sort((a, b) => (a.seq || 0) - (b.seq || 0) || (a.start ?? "").localeCompare(b.start ?? ""));
          const start = ordered.find((item) => item.start)?.start ?? "";
          return { courtId, start, matches: ordered };
        }),
      );
      return { iso, start: courts.find((court) => court.start)?.start ?? "", courts };
    });
}

async function pull(url: string) {
  const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
  if (!res.ok) throw new Error(`WTA ${res.status}`);
  return res.json();
}

export async function getWtaBoard(): Promise<WtaBoard> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;

  const [matchesRes, oopRes] = await Promise.allSettled([pull(WTA_MATCHES_URL), pull(WTA_OOP_URL)]);
  const scored = new Map<string, WtaScore>();
  let updatedAt: string | null = null;

  if (matchesRes.status === "fulfilled") {
    const json = matchesRes.value as { lastUpdated?: string; matches?: RawMatch[] };
    updatedAt = json.lastUpdated ?? updatedAt;
    for (const raw of json.matches ?? []) {
      const row = normalizeMatch(raw);
      if (row) scored.set(row.id, row);
    }
  }

  const merged = new Map<string, WtaScore>(scored);

  if (oopRes.status === "fulfilled") {
    for (const day of parseOop(oopRes.value)) {
      const iso = day.ISODate ?? "";
      if (!iso) continue;
      for (const court of asList(day.Court)) {
        const courtId = mapCourtName(court.CourtName);
        const matches = asList(court.Matches?.Match);
        matches.forEach((raw, index) => {
          const oop = fromOopMatch(raw, iso, courtId);
          if (!oop) return;
          if (!oop.seq) oop.seq = index + 1;
          const hit = merged.get(oop.id);
          merged.set(oop.id, hit ? mergeRow(hit, oop) : oop);
        });
      }
    }
  }

  const matches = [...merged.values()];
  const data: WtaBoard = {
    updatedAt: updatedAt ?? new Date().toISOString(),
    matches,
    days: buildDays(matches),
  };
  cache = { at: Date.now(), data };
  return data;
}

export function pickFocusDay(days: WtaDay[], iso: string) {
  const open = (day: WtaDay) =>
    day.courts.some((court) => court.matches.some((row) => row.state === "live" || row.state === "scheduled"));
  const today = days.find((day) => day.iso === iso);
  if (today && open(today)) return today;
  return days.find((day) => day.iso > iso && day.courts.some((court) => court.matches.length)) ?? today ?? null;
}

export function heroMatches(day: WtaDay | null, live: WtaScore[]) {
  if (live.length) return live;
  if (!day) return [];
  return day.courts
    .map((court) => court.matches.find((row) => row.state === "scheduled" || row.state === "live"))
    .filter((row): row is WtaScore => Boolean(row));
}

export function alignScore(score: WtaScore, aName: string, bName: string): WtaScore {
  const ka = lastKey(aName);
  const kb = lastKey(bName);
  if (near(score.a.lastKey, ka) && near(score.b.lastKey, kb)) return score;
  if (near(score.a.lastKey, kb) && near(score.b.lastKey, ka)) {
    return {
      ...score,
      a: score.b,
      b: score.a,
      sets: score.sets.map(([x, y]) => [y, x]),
      points: score.points ? [score.points[1], score.points[0]] : undefined,
      serving: score.serving === "a" ? "b" : score.serving === "b" ? "a" : undefined,
      winner: score.winner === "a" ? "b" : score.winner === "b" ? "a" : undefined,
    };
  }
  return score;
}

export function findScore(matches: WtaScore[], aName: string, bName: string) {
  const ka = lastKey(aName);
  const kb = lastKey(bName);
  const hit = matches.find(
    (row) =>
      (near(row.a.lastKey, ka) && near(row.b.lastKey, kb)) ||
      (near(row.a.lastKey, kb) && near(row.b.lastKey, ka)),
  );
  return hit ? alignScore(hit, aName, bName) : null;
}
