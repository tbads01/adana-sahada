import { content } from "./content";
import { FAQS, FOOD_COURT_STANDS, sortedAnnouncements } from "./guide";
import { MATCH_PLAN, type MatchDay } from "./match-plan";
import players from "./players.json";
import { TICKETS_URL } from "./site";

const NEUTRAL = new Set(["RUS", "BLR"]);

export type SharedDay = {
  weekday: string;
  date: string;
  stage: string;
  events: { time: string; title: string; tag: "match" | "music" | "event" }[];
};

export type SharedFacts = {
  source: "m.adanaopen.com";
  updatedAt: string;
  ticketsUrl: { tr: string; en: string };
  ticketsBody: { tr: string; en: string };
  scheduleNote: { tr: string; en: string };
  matchNote: { tr: string; en: string };
  days: { tr: SharedDay[]; en: SharedDay[] };
  matchPlan: MatchDay[];
  foodCourtStands: string[];
  players: typeof players;
  faqs: { q: { tr: string; en: string }; a: { tr: string; en: string } }[];
  announcements: {
    id: string;
    date: string;
    pin?: boolean;
    tag: { tr: string; en: string };
    title: { tr: string; en: string };
    body: { tr: string; en: string };
    href?: string;
  }[];
};

function neutralizeCountry<T extends { country?: string }>(row: T): T {
  if (row.country && NEUTRAL.has(row.country)) return { ...row, country: "WLD" };
  return row;
}

function neutralizePlayers(data: typeof players) {
  const mapList = <T extends { country?: string }>(list: T[] | undefined) =>
    (list ?? []).map((row) => neutralizeCountry(row));
  return {
    ...data,
    mainDraw: mapList(data.mainDraw),
    qualifying: mapList(data.qualifying),
    spotlight: mapList(data.spotlight),
  };
}

function publicPlan(plan: MatchDay[]): MatchDay[] {
  return plan.map((day) => ({
    dateKey: day.dateKey,
    start: day.start,
    total: day.total,
    courts: day.courts.map((court) => ({
      id: court.id,
      start: court.start,
      slots: court.slots,
    })),
  }));
}

export function getSharedFacts(): SharedFacts {
  return {
    source: "m.adanaopen.com",
    updatedAt: "2026-09-27",
    ticketsUrl: {
      tr: TICKETS_URL,
      en: TICKETS_URL.replace("/TURKIYE/tr/", "/TURKIYE/en/"),
    },
    ticketsBody: {
      tr: content.tr.tickets.body,
      en: content.en.tickets.body,
    },
    scheduleNote: {
      tr: content.tr.schedule.note,
      en: content.en.schedule.note,
    },
    matchNote: {
      tr: content.tr.schedule.matchNote,
      en: content.en.schedule.matchNote,
    },
    days: {
      tr: content.tr.schedule.days,
      en: content.en.schedule.days,
    },
    matchPlan: publicPlan(MATCH_PLAN),
    foodCourtStands: [...FOOD_COURT_STANDS],
    players: neutralizePlayers(players),
    faqs: FAQS,
    announcements: sortedAnnouncements().map((item) => ({
      id: item.id,
      date: item.date,
      pin: item.pin,
      tag: item.tag,
      title: item.title,
      body: item.body,
      href: item.href,
    })),
  };
}
