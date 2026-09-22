import { content } from "./content";
import { flagFor } from "./flags";
import {
  ANNOUNCEMENTS,
  ATTRACTIONS,
  FAQS,
  FOOD_COURT_STANDS,
  INFO_ITEMS,
  MATCH_DAYS,
  PRESS_CONFERENCE,
  getLiveData,
  istanbulIsoDate,
  pressConferenceUpcoming,
  tournamentPhase,
} from "./guide";
import { MATCH_PLAN, roundKind, type MatchRound } from "./match-plan";
import playersData from "./players.json";
import { loadSubscriptions } from "./push-store";
import { TOURNAMENT_END, TOURNAMENT_START } from "./site";
import { loadAnalytics, listLive, livePeakToday, emptyDay, type DayBucket } from "./analytics-store";

export type AdminDashboard = Awaited<ReturnType<typeof buildAdminDashboard>>;

type PlayerRow = {
  name: string;
  country: string;
  rank: number | null;
  careerHigh: number | null;
  entry?: string;
  image: string | null;
  dob?: string;
  prize?: string;
};

const PAGE_LABELS: Record<string, string> = {
  "/": "Ana sayfa",
  "/maclar": "Maçlar",
  "/etkinlikler": "Etkinlikler",
  "/canli": "Canlı",
  "/bilgi": "Saha",
  "/oyuncular": "Oyuncular",
  "/duyurular": "Duyurular",
  "/gonder": "Bildirim gönder",
};

const ENTRY_LABELS: Record<string, string> = {
  main: "Doğrudan kabul",
  alternate: "Yedek",
  wildcard: "Wildcard",
  qualifier: "Eleme",
};

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00+03:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return istanbulIsoDate(date.getTime());
}

const REF_LABELS: Record<string, string> = {
  direct: "Doğrudan",
  google: "Google",
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  x: "X",
  youtube: "YouTube",
  bing: "Bing",
  tiktok: "TikTok",
  biletix: "Biletix",
  "adanaopen.com": "adanaopen.com",
  other: "Diğer",
};

function ranked(
  map: Record<string, number> | undefined,
  labels: Record<string, string>,
) {
  return Object.entries(map ?? {})
    .sort((a, b) => b[1] - a[1])
    .map(([id, views]) => ({
      id,
      label: labels[id] ?? PAGE_LABELS[id] ?? id,
      views,
    }));
}

function dayLabel(iso: string) {
  const t = Date.parse(`${iso}T12:00:00+03:00`);
  return {
    weekday: new Intl.DateTimeFormat("tr-TR", { weekday: "short", timeZone: "Europe/Istanbul" }).format(t),
    label: new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" }).format(t),
  };
}

function parsePrize(value?: string) {
  if (!value) return 0;
  return Number(value.replace(/[^0-9]/g, "")) || 0;
}

function ageFromDob(dob?: string) {
  if (!dob) return null;
  const born = Date.parse(dob);
  if (Number.isNaN(born)) return null;
  return Math.floor((Date.now() - born) / (365.25 * 86_400_000));
}

export async function buildAdminDashboard() {
  const [analytics, subs] = await Promise.all([loadAnalytics(), loadSubscriptions()]);
  const now = Date.now();
  const today = istanbulIsoDate(now);
  const yesterday = addDays(today, -1);
  const phase = tournamentPhase(now);
  const live = getLiveData();
  const players = playersData.mainDraw as PlayerRow[];
  const program = content.tr.schedule.days;
  const courtNames = content.tr.schedule.courts;
  const courtNamed = content.tr.schedule.courtNamed;
  const roundNames = content.tr.schedule.rounds;

  const todayBucket = analytics.days[today] ?? emptyDay();
  const yesterdayBucket = analytics.days[yesterday] ?? emptyDay();

  const recorded = Object.keys(analytics.days).sort();
  const firstIso = recorded[0] ?? addDays(today, -13);
  const calendar: string[] = [];
  for (let iso = firstIso; iso <= today; iso = addDays(iso, 1)) {
    calendar.push(iso);
    if (calendar.length > 60) break;
  }

  const days = calendar.map((iso) => {
    const day: DayBucket = analytics.days[iso] ?? emptyDay();
    const hours = Array.from({ length: 24 }, (_, i) => day.hours?.[i] ?? 0);
    const meta = dayLabel(iso);
    return {
      iso,
      weekday: meta.weekday,
      label: meta.label,
      views: day.views,
      unique: day.unique,
      tickets: day.tickets ?? 0,
      hours,
      locales: { tr: day.locales?.tr ?? 0, en: day.locales?.en ?? 0 },
      pages: ranked(day.pages, PAGE_LABELS),
      refs: ranked(day.refs, REF_LABELS),
      ticketPages: ranked(day.ticketPages, PAGE_LABELS),
    };
  });

  const last7Isos = calendar.slice(-7);
  const views7 = last7Isos.reduce((sum, iso) => sum + (analytics.days[iso]?.views ?? 0), 0);
  const unique7 = last7Isos.reduce((sum, iso) => sum + (analytics.days[iso]?.unique ?? 0), 0);
  const tickets7 = last7Isos.reduce((sum, iso) => sum + (analytics.days[iso]?.tickets ?? 0), 0);
  const viewsTotal = days.reduce((sum, day) => sum + day.views, 0);
  const uniqueTotal = days.reduce((sum, day) => sum + day.unique, 0);
  const ticketsTotal = days.reduce((sum, day) => sum + day.tickets, 0);

  const recentVisits = analytics.visits.slice(-60).map((visit) => ({
    t: visit.t,
    kind: "view" as const,
    path: visit.p,
    label: PAGE_LABELS[visit.p] ?? visit.p,
    locale: visit.l,
    ref: REF_LABELS[visit.r || "direct"] ?? visit.r ?? "Doğrudan",
  }));
  const recentTickets = (analytics.events ?? []).slice(-40).map((event) => ({
    t: event.t,
    kind: "ticket" as const,
    path: event.p,
    label: PAGE_LABELS[event.p] ?? event.p,
    locale: event.l,
    ref: "Biletix",
  }));
  const recent = [...recentVisits, ...recentTickets].sort((a, b) => b.t - a.t).slice(0, 40);

  const liveNow = listLive(now);
  const livePagesMap: Record<string, number> = {};
  const liveLocales = { tr: 0, en: 0 };
  for (const row of liveNow) {
    livePagesMap[row.p] = (livePagesMap[row.p] ?? 0) + 1;
    liveLocales[row.l] += 1;
  }
  const online = {
    now: liveNow.length,
    peak: livePeakToday(now),
    locales: liveLocales,
    pages: Object.entries(livePagesMap)
      .sort((a, b) => b[1] - a[1])
      .map(([path, count]) => ({ path, label: PAGE_LABELS[path] ?? path, count })),
    visitors: liveNow.slice(0, 24).map((row) => ({
      t: row.t,
      path: row.p,
      label: PAGE_LABELS[row.p] ?? row.p,
      locale: row.l,
      ref: REF_LABELS[row.r] ?? row.r,
    })),
  };

  const matchTotal = MATCH_PLAN.reduce((sum, day) => sum + day.total, 0);
  const matchPlayed = MATCH_DAYS.filter((day) => day.iso < today).reduce((sum, day) => sum + day.total, 0);
  const matchRemaining = MATCH_DAYS.filter((day) => day.iso >= today).reduce((sum, day) => sum + day.total, 0);
  const todayPlan = MATCH_DAYS.find((day) => day.iso === today);

  const byRound: Record<string, number> = {};
  const byCourt: Record<string, number> = { cc: 0, c1: 0, c2: 0 };
  const byKind = { qual: 0, singles: 0, doubles: 0 };
  for (const day of MATCH_PLAN) {
    for (const court of day.courts) {
      byCourt[court.id] += court.slots.length;
      for (const slot of court.slots) {
        byRound[slot] = (byRound[slot] ?? 0) + 1;
        byKind[roundKind(slot)] += 1;
      }
    }
  }

  const matchDays = MATCH_DAYS.map((day, index) => ({
    iso: day.iso,
    dateKey: day.dateKey,
    weekday: program[index]?.weekday ?? "",
    date: program[index]?.date ?? "",
    stage: program[index]?.stage ?? "",
    start: day.start.trim() ? day.start : "Yakında",
    total: day.total,
    courts: day.courts.map((court) => ({
      id: court.id,
      name: courtNamed[court.id] ? `${courtNames[court.id]} · ${courtNamed[court.id]}` : courtNames[court.id],
      start: court.start.trim() ? court.start : "Yakında",
      slots: court.slots.length,
    })),
    status: day.iso < today ? "geçti" : day.iso === today ? "bugün" : "bekliyor",
  }));

  const programStats = program.map((day, index) => ({
    iso: MATCH_DAYS[index]?.iso ?? "",
    weekday: day.weekday,
    date: day.date,
    stage: day.stage,
    match: day.events.filter((item) => item.tag === "match").length,
    music: day.events.filter((item) => item.tag === "music").length,
    event: day.events.filter((item) => item.tag === "event").length,
    total: day.events.length,
  }));

  const countryMap = new Map<string, number>();
  const entryMap = new Map<string, number>();
  const rankBands = { top100: 0, to150: 0, to200: 0, over200: 0, unranked: 0 };
  let photo = 0;
  let prizeTotal = 0;
  let ageSum = 0;
  let ageCount = 0;
  let turkey = 0;
  let careerBest = { name: "", rank: 9999 };

  for (const player of players) {
    countryMap.set(player.country, (countryMap.get(player.country) ?? 0) + 1);
    const entry = player.entry || "main";
    entryMap.set(entry, (entryMap.get(entry) ?? 0) + 1);
    if (player.image) photo += 1;
    if (player.country === "TUR") turkey += 1;
    prizeTotal += parsePrize(player.prize);
    const age = ageFromDob(player.dob);
    if (age != null) {
      ageSum += age;
      ageCount += 1;
    }
    const rank = player.rank;
    if (rank == null) rankBands.unranked += 1;
    else if (rank <= 100) rankBands.top100 += 1;
    else if (rank <= 150) rankBands.to150 += 1;
    else if (rank <= 200) rankBands.to200 += 1;
    else rankBands.over200 += 1;
    const high = player.careerHigh ?? 9999;
    if (high < careerBest.rank) careerBest = { name: player.name, rank: high };
  }

  const countries = [...countryMap.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([code, count]) => ({ code, count, flag: flagFor(code) }));

  const startMs = Date.parse(TOURNAMENT_START);
  const endMs = Date.parse(TOURNAMENT_END);
  const msLeft = phase === "ended" ? 0 : Math.max(0, (phase === "upcoming" ? startMs : endMs) - now);

  const newSubs = subs.filter((item) => {
    const added = "addedAt" in item ? Number((item as { addedAt?: number }).addedAt) : 0;
    return added > now - 86_400_000;
  }).length;

  return {
    generatedAt: now,
    today,
    phase,
    countdown: {
      target: phase === "upcoming" ? "start" : phase === "live" ? "end" : "over",
      days: Math.floor(msLeft / 86_400_000),
      hours: Math.floor((msLeft % 86_400_000) / 3_600_000),
    },
    traffic: {
      today: {
        views: todayBucket.views,
        unique: todayBucket.unique,
        tickets: todayBucket.tickets ?? 0,
        hours: todayBucket.hours,
        locales: todayBucket.locales,
      },
      yesterday: {
        views: yesterdayBucket.views,
        unique: yesterdayBucket.unique,
        tickets: yesterdayBucket.tickets ?? 0,
      },
      d7: { views: views7, unique: unique7, tickets: tickets7 },
      total: { views: viewsTotal, unique: uniqueTotal, tickets: ticketsTotal },
      days,
      recent,
      live: online,
    },
    notify: {
      devices: subs.length,
      new24h: newSubs,
      lastSubscribeAt: analytics.notify.lastAt,
      sends: [...analytics.sends].slice(-12).reverse(),
    },
    matches: {
      total: matchTotal,
      played: matchPlayed,
      remaining: matchRemaining,
      today: todayPlan
        ? {
            iso: todayPlan.iso,
            start: todayPlan.start,
            total: todayPlan.total,
            courts: todayPlan.courts.length,
          }
        : null,
      byKind,
      byCourt: Object.entries(byCourt).map(([id, count]) => ({
        id,
        name: courtNames[id as keyof typeof courtNames] ?? id,
        count,
      })),
      byRound: Object.entries(byRound).map(([round, count]) => ({
        round: round as MatchRound,
        label: roundNames[round as MatchRound] ?? round,
        kind: roundKind(round as MatchRound),
        count,
      })),
      days: matchDays,
    },
    program: {
      days: programStats,
      totals: programStats.reduce(
        (acc, day) => {
          acc.match += day.match;
          acc.music += day.music;
          acc.event += day.event;
          acc.total += day.total;
          return acc;
        },
        { match: 0, music: 0, event: 0, total: 0 },
      ),
    },
    players: {
      total: players.length,
      main: entryMap.get("main") ?? 0,
      alternate: entryMap.get("alternate") ?? 0,
      turkey,
      photo,
      missingPhoto: players.length - photo,
      avgAge: ageCount ? Math.round((ageSum / ageCount) * 10) / 10 : null,
      prizeTotal,
      careerBest: careerBest.rank === 9999 ? null : careerBest,
      rankBands,
      countries,
      entries: [...entryMap.entries()].map(([id, count]) => ({
        id,
        label: ENTRY_LABELS[id] ?? id,
        count,
      })),
    },
    content: {
      announcements: ANNOUNCEMENTS.length,
      pinned: ANNOUNCEMENTS.filter((item) => item.pin).length,
      faqs: FAQS.length,
      info: INFO_ITEMS.length,
      attractions: ATTRACTIONS.length,
      foodStands: FOOD_COURT_STANDS.length,
      press: {
        iso: PRESS_CONFERENCE.iso,
        time: PRESS_CONFERENCE.time,
        place: PRESS_CONFERENCE.place.tr,
        upcoming: pressConferenceUpcoming(now),
      },
    },
    live: {
      status: live.stream.status,
      hasUrl: Boolean(live.stream.url),
      platform: live.stream.platform,
      updatedAt: live.updatedAt,
      scoreboard: live.scoreboard.length,
      liveCourts: live.scoreboard.filter((row) => row.status === "live").length,
    },
    health: {
      vapidPublic: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      vapidPrivate: Boolean(process.env.VAPID_PRIVATE_KEY),
      adminSecret: Boolean(process.env.PUSH_ADMIN_SECRET),
      analyticsDays: Object.keys(analytics.days).length,
    },
  };
}
