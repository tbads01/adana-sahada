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

export type MatchDay = {
  dateKey: string;
  start: string;
  total: number;
  courts: { id: CourtId; start: string; slots: MatchRound[] }[];
};

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
      { id: "cc", start: "10:30", slots: ["QS1", "QS1", "QS1"] },
      { id: "c1", start: "10:30", slots: ["QS1", "QS1", "QS1"] },
      { id: "c2", start: "10:30", slots: ["QS1", "QS1"] },
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
