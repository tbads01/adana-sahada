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

export type MatchDay = {
  dateKey: string;
  start: string;
  total: number;
  courts: { id: CourtId; start: string; slots: MatchRound[] }[];
};

export const MATCH_PLAN: MatchDay[] = [
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
    start: "16:30",
    total: 10,
    courts: [
      { id: "cc", start: "17:00", slots: ["MS1", "MS1", "MS1", "MD1"] },
      { id: "c1", start: "16:30", slots: ["MS1", "MS1", "MS1"] },
      { id: "c2", start: "16:30", slots: ["MS1", "MD1", "MD1"] },
    ],
  },
  {
    dateKey: "29",
    start: "17:00",
    total: 9,
    courts: [
      { id: "cc", start: "17:00", slots: ["MS1", "MS1", "MS1"] },
      { id: "c1", start: "17:00", slots: ["MS1", "MS1", "MS1"] },
      { id: "c2", start: "17:00", slots: ["MS1", "MS1", "MS1"] },
    ],
  },
  {
    dateKey: "30",
    start: "17:00",
    total: 9,
    courts: [
      { id: "cc", start: "17:00", slots: ["MS2", "MS2", "MS2"] },
      { id: "c1", start: "17:00", slots: ["MS2", "MD1", "MD1"] },
      { id: "c2", start: "17:00", slots: ["MD1", "MD1", "MD1"] },
    ],
  },
  {
    dateKey: "01",
    start: "17:00",
    total: 8,
    courts: [
      { id: "cc", start: "17:00", slots: ["MS2", "MS2", "MS2"] },
      { id: "c1", start: "17:00", slots: ["MS2", "MDQF", "MDQF"] },
      { id: "c2", start: "17:00", slots: ["MDQF", "MDQF"] },
    ],
  },
  {
    dateKey: "02",
    start: "17:00",
    total: 6,
    courts: [
      { id: "cc", start: "17:00", slots: ["MSQF", "MSQF", "MSQF"] },
      { id: "c1", start: "17:00", slots: ["MSQF", "MDSF", "MDSF"] },
    ],
  },
  {
    dateKey: "03",
    start: "17:00",
    total: 3,
    courts: [{ id: "cc", start: "17:00", slots: ["MSSF", "MSSF", "MDF"] }],
  },
  {
    dateKey: "04",
    start: "18:00",
    total: 1,
    courts: [{ id: "cc", start: "18:00", slots: ["MSF"] }],
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
