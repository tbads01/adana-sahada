export type MatchRound =
  | "QS1"
  | "QSF"
  | "MS1"
  | "MS2"
  | "MSQF"
  | "MSSF"
  | "MSF"
  | "MD1"
  | "MDQF"
  | "MDSF"
  | "MDF";

export type CourtId = "cc" | "c1" | "c2";

export const TBA_START = "";

export function isStartTba(start: string) {
  return !start.trim();
}

export type OrderPlayer = {
  name: string;
  country: string;
  seed?: number;
  wc?: boolean;
};

export type OrderMatch = {
  round: MatchRound;
  start?: string;
  notBefore?: boolean;
  a: OrderPlayer;
  b: OrderPlayer;
};

export type MatchCourt = {
  id: CourtId;
  start: string;
  slots: MatchRound[];
  matches?: OrderMatch[];
};

export type MatchDay = {
  dateKey: string;
  start: string;
  total: number;
  courts: MatchCourt[];
};

export function playerTag(player: OrderPlayer) {
  if (player.wc) return "WC";
  if (player.seed) return `[${player.seed}]`;
  return "";
}

export const MATCH_SLOT_MIN = 90;

export type PlayStatus = "live" | "next" | "later";

export type TimedPlay = {
  courtId: CourtId;
  index: number;
  match: OrderMatch;
  startMin: number;
  endMin: number;
  status: PlayStatus;
};

export function parseHhMm(time?: string) {
  if (!time?.includes(":")) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  return h * 60 + (m || 0);
}

export function formatHhMm(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeCourtMatches(court: MatchCourt) {
  const base = parseHhMm(court.start) ?? 10 * 60 + 30;
  let cursor = base;
  return (court.matches ?? []).map((match, index) => {
    const explicit = parseHhMm(match.start);
    let startMin = cursor;
    if (explicit != null) {
      startMin = match.notBefore ? Math.max(cursor, explicit) : explicit;
    }
    const endMin = startMin + MATCH_SLOT_MIN;
    cursor = endMin;
    return { courtId: court.id, index, match, startMin, endMin };
  });
}

export function liveOrder(day: MatchDay, nowMin: number | null): TimedPlay[] {
  const rows = day.courts.flatMap(timeCourtMatches);
  const open = nowMin == null ? rows : rows.filter((row) => row.endMin > nowMin);
  const onCourt = nowMin == null ? [] : open.filter((row) => row.startMin <= nowMin);
  const waiting = nowMin == null ? open : open.filter((row) => row.startMin > nowMin);
  const nextAt = waiting.length ? Math.min(...waiting.map((row) => row.startMin)) : null;
  return open.map((row) => {
    const live = onCourt.some((item) => item.courtId === row.courtId && item.index === row.index);
    const next = !live && nextAt != null && row.startMin === nextAt;
    return { ...row, status: live ? "live" : next ? "next" : "later" };
  });
}

export function groupLiveOrder(plays: TimedPlay[]) {
  const map = new Map<CourtId, TimedPlay[]>();
  for (const play of plays) {
    const list = map.get(play.courtId) ?? [];
    list.push(play);
    map.set(play.courtId, list);
  }
  return [...map.entries()].map(([courtId, matches]) => ({ courtId, matches }));
}

export const MATCH_PLAN: MatchDay[] = [
  {
    dateKey: "25",
    start: "18:00",
    total: 0,
    courts: [],
  },
  {
    dateKey: "26",
    start: "10:30",
    total: 8,
    courts: [
      {
        id: "cc",
        start: "10:30",
        slots: ["QS1", "QS1", "QS1"],
        matches: [
          {
            round: "QS1",
            start: "10:30",
            a: { name: "Melis Keser", country: "TUR", wc: true },
            b: { name: "Elena Ruxandra Bertea", country: "ROU", seed: 7 },
          },
          {
            round: "QS1",
            a: { name: "Ayşegül Mert", country: "TUR", wc: true },
            b: { name: "Anastasia Tikhonova", country: "RUS", seed: 5 },
          },
          {
            round: "QS1",
            a: { name: "Piraye Özdemir", country: "TUR", wc: true },
            b: { name: "Lois Boisson", country: "FRA", seed: 6 },
          },
        ],
      },
      {
        id: "c1",
        start: "10:30",
        slots: ["QS1", "QS1"],
        matches: [
          {
            round: "QS1",
            start: "10:30",
            a: { name: "Viktoria Hruncakova", country: "SVK", seed: 2 },
            b: { name: "Jaeda Daniel", country: "USA" },
          },
          {
            round: "QS1",
            a: { name: "Fiona Crawley", country: "USA", seed: 4 },
            b: { name: "Adelina Lachinova", country: "LAT" },
          },
        ],
      },
      {
        id: "c2",
        start: "10:30",
        slots: ["QS1", "QS1", "QS1"],
        matches: [
          {
            round: "QS1",
            start: "10:30",
            a: { name: "Anna Siskova", country: "CZE", seed: 1 },
            b: { name: "Gina Feistel", country: "POL" },
          },
          {
            round: "QS1",
            a: { name: "Erika Andreeva", country: "RUS", seed: 3 },
            b: { name: "İlay Yörük", country: "TUR" },
          },
          {
            round: "QS1",
            start: "14:00",
            notBefore: true,
            a: { name: "Isabella Shinikova", country: "BUL" },
            b: { name: "Elena Micic", country: "AUS", seed: 8 },
          },
        ],
      },
    ],
  },
  {
    dateKey: "27",
    start: "10:30",
    total: 4,
    courts: [
      { id: "cc", start: "10:30", slots: ["QSF", "QSF"] },
      { id: "c1", start: "10:30", slots: ["QSF", "QSF"] },
    ],
  },
  {
    dateKey: "28",
    start: TBA_START,
    total: 10,
    courts: [
      { id: "cc", start: TBA_START, slots: ["MS1", "MS1", "MS1", "MD1"] },
      { id: "c1", start: TBA_START, slots: ["MS1", "MS1", "MS1"] },
      { id: "c2", start: TBA_START, slots: ["MS1", "MD1", "MD1"] },
    ],
  },
  {
    dateKey: "29",
    start: TBA_START,
    total: 9,
    courts: [
      { id: "cc", start: TBA_START, slots: ["MS1", "MS1", "MS1"] },
      { id: "c1", start: TBA_START, slots: ["MS1", "MS1", "MS1"] },
      { id: "c2", start: TBA_START, slots: ["MS1", "MS1", "MS1"] },
    ],
  },
  {
    dateKey: "30",
    start: TBA_START,
    total: 9,
    courts: [
      { id: "cc", start: TBA_START, slots: ["MS2", "MS2", "MS2"] },
      { id: "c1", start: TBA_START, slots: ["MS2", "MD1", "MD1"] },
      { id: "c2", start: TBA_START, slots: ["MD1", "MD1", "MD1"] },
    ],
  },
  {
    dateKey: "01",
    start: TBA_START,
    total: 8,
    courts: [
      { id: "cc", start: TBA_START, slots: ["MS2", "MS2", "MS2"] },
      { id: "c1", start: TBA_START, slots: ["MS2", "MDQF", "MDQF"] },
      { id: "c2", start: TBA_START, slots: ["MDQF", "MDQF"] },
    ],
  },
  {
    dateKey: "02",
    start: TBA_START,
    total: 6,
    courts: [
      { id: "cc", start: TBA_START, slots: ["MSQF", "MSQF", "MSQF"] },
      { id: "c1", start: TBA_START, slots: ["MSQF", "MDSF", "MDSF"] },
    ],
  },
  {
    dateKey: "03",
    start: TBA_START,
    total: 3,
    courts: [{ id: "cc", start: TBA_START, slots: ["MSSF", "MSSF", "MDF"] }],
  },
  {
    dateKey: "04",
    start: TBA_START,
    total: 1,
    courts: [{ id: "cc", start: TBA_START, slots: ["MSF"] }],
  },
];

export function uniqueRounds(day: MatchDay): MatchRound[] {
  const seen = new Set<MatchRound>();
  const out: MatchRound[] = [];
  for (const court of day.courts) {
    for (const slot of court.slots) {
      if (!seen.has(slot)) {
        seen.add(slot);
        out.push(slot);
      }
    }
  }
  return out;
}

export function roundKind(round: MatchRound): "qual" | "singles" | "doubles" {
  if (round.startsWith("QS")) return "qual";
  if (round.startsWith("MD")) return "doubles";
  return "singles";
}
