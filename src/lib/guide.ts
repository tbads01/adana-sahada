import type { Locale } from "./content";
import live from "./live.json";
import { MATCH_PLAN, type CourtId, type MatchDay, type MatchRound } from "./match-plan";
import { INSTAGRAM, LIVE_STREAM_URL, MAPS_URL, TOURNAMENT_END, TOURNAMENT_START, WTA_URL } from "./site";

export type Copy = { tr: string; en: string };
export type GuidePhase = "upcoming" | "live" | "ended";
export type StreamStatus = "soon" | "live" | "ended";
export type CourtStatus = "live" | "next" | "complete" | "warmup";

export type ScoreboardMatch = {
  courtId: CourtId;
  status: CourtStatus;
  round: MatchRound;
  a: { name: string; country: string };
  b: { name: string; country: string };
  sets: number[][];
  serving?: "a" | "b";
};

export type Announcement = {
  id: string;
  date: string;
  pin?: boolean;
  tag: Copy;
  title: Copy;
  body: Copy;
  href?: string;
};

export type InfoItem = {
  id: string;
  icon: "pin" | "car" | "ticket" | "food" | "court" | "player" | "sun" | "child" | "phone" | "press";
  title: Copy;
  body: Copy;
  href?: string;
  hrefLabel?: Copy;
};

export type Faq = { q: Copy; a: Copy };

export type LiveData = {
  updatedAt: string;
  stream: { status: StreamStatus; url: string; platform: string };
  scoreboard: ScoreboardMatch[];
};

export const GUIDE_TZ = "Europe/Istanbul";

const liveData = live as LiveData;

export function copy(locale: Locale, value: Copy) {
  return value[locale];
}

export function dateKeyToIso(dateKey: string) {
  const n = Number(dateKey);
  const day = dateKey.padStart(2, "0");
  return n >= 25 ? `2026-09-${day}` : `2026-10-${day}`;
}

export function isoToDateKey(iso: string) {
  return iso.slice(8, 10);
}

export function tournamentPhase(now = Date.now()): GuidePhase {
  if (now >= Date.parse(TOURNAMENT_END)) return "ended";
  if (now >= Date.parse(TOURNAMENT_START)) return "live";
  return "upcoming";
}

export function istanbulIsoDate(now = Date.now()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: GUIDE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function matchDayForDate(iso: string): MatchDay | undefined {
  return MATCH_PLAN.find((day) => dateKeyToIso(day.dateKey) === iso);
}

export function activeOrNextMatchDay(now = Date.now()) {
  const today = istanbulIsoDate(now);
  const playable = MATCH_PLAN.filter((day) => day.courts.length);
  const todayPlan = playable.find((day) => dateKeyToIso(day.dateKey) === today);
  if (todayPlan) return { day: todayPlan, iso: today, isToday: true };
  const next = playable.find((day) => dateKeyToIso(day.dateKey) > today);
  if (next) return { day: next, iso: dateKeyToIso(next.dateKey), isToday: false };
  const last = playable[playable.length - 1] ?? MATCH_PLAN[MATCH_PLAN.length - 1];
  return { day: last, iso: dateKeyToIso(last.dateKey), isToday: false };
}

export function activeOrNextProgramDay(now = Date.now()) {
  const today = istanbulIsoDate(now);
  if (MATCH_DAYS.some((day) => day.iso === today)) return today;
  return MATCH_DAYS.find((day) => day.iso > today)?.iso ?? MATCH_DAYS[0]?.iso ?? today;
}

export function getLiveData(): LiveData {
  const url = LIVE_STREAM_URL || liveData.stream.url;
  return {
    ...liveData,
    stream: {
      ...liveData.stream,
      url,
      status: url && liveData.stream.status === "soon" ? "live" : liveData.stream.status,
    },
  };
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "press-launch",
    date: "2026-09-19",
    pin: true,
    tag: { tr: "Etkinlik", en: "Events" },
    title: {
      tr: "Basın toplantısı Cuma 18:00, Taş Köprü",
      en: "Press conference Friday 18:00 at Taş Köprü",
    },
    body: {
      tr: "Adana Open basın toplantısı 25 Eylül Cuma 18:00’de Taş Köprü’de. Ertesi sabah eleme 10:30’da ATDSK’de başlar.",
      en: "The Adana Open press conference is Friday 25 September at 18:00 on Taş Köprü. Qualifying starts 10:30 the next morning at ATDSK.",
    },
    href: "/etkinlikler",
  },
  {
    id: "main-draw",
    date: "2026-09-17",
    pin: true,
    tag: { tr: "Oyuncular", en: "Players" },
    title: {
      tr: "Ana tablo doğrudan kabul listesi açıklandı",
      en: "Direct-acceptance main draw is out",
    },
    body: {
      tr: "23 oyuncu ana tabloya doğrudan kabul edildi. Dört wildcard, bir special exempt ve dört eleme kazananı henüz açıklanmadı.",
      en: "23 players have direct acceptance. Four wildcards, one special exempt and four qualifying winners are still to come.",
    },
    href: "/oyuncular",
  },
  {
    id: "side-events",
    date: "2026-09-10",
    pin: true,
    tag: { tr: "Etkinlik", en: "Events" },
    title: {
      tr: "Yan etkinlikler duyuruldu",
      en: "Side events are announced",
    },
    body: {
      tr: "Yoga, DJ Yusuf Erdem ve 3 Ekim Cardio Fitness · Coffee Disco programı yayında. Maç saatleri WTA taslak planına göredir.",
      en: "Yoga, DJ Yusuf Erdem and the 3 October Cardio Fitness · Coffee Disco programme are live. Match times follow the WTA draft plan.",
    },
    href: "/etkinlikler",
  },
  {
    id: "qualifying",
    date: "2026-09-08",
    tag: { tr: "Maç", en: "Matches" },
    title: {
      tr: "Eleme 26–27 Eylül, ilk top 10:30",
      en: "Qualifying 26–27 September, first ball 10:30",
    },
    body: {
      tr: "Eleme 1. tur 26 Eylül 10:30’da Merkez Kort, Kort 1 ve Kort 2’de başlar. Ana tablo 28 Eylül 16:30, final 4 Ekim 18:00 Merkez Kort.",
      en: "Qualifying round one starts 26 September at 10:30 on Centre Court, Court 1 and Court 2. Main draw 28 September 16:30, final 4 October 18:00 on Centre Court.",
    },
    href: "/maclar",
  },
  {
    id: "tickets",
    date: "2026-09-01",
    tag: { tr: "Bilet", en: "Tickets" },
    title: {
      tr: "Bilet satışı yakında",
      en: "Ticket sales coming soon",
    },
    body: {
      tr: "Koltuk ve giriş bilgisi açıklandığında buradan duyurulacak. Şimdilik info@adanaopen.com ve Instagram @adana.open.",
      en: "Seat and entry details will land here when they are published. For now: info@adanaopen.com and Instagram @adana.open.",
    },
    href: "https://adanaopen.com/iletisim",
  },
];

export function sortedAnnouncements() {
  return [...ANNOUNCEMENTS].sort((a, b) => {
    if (a.pin && !b.pin) return -1;
    if (!a.pin && b.pin) return 1;
    return b.date.localeCompare(a.date);
  });
}

export const INFO_ITEMS: InfoItem[] = [
  {
    id: "venue",
    icon: "pin",
    title: { tr: "Nasıl gelirim?", en: "How to get there" },
    body: {
      tr: "ATDSK, Adnan Menderes Bulvarı, Seyhan Baraj Gölü yanı, Çukurova / Adana. Taksi, özel araç veya harita uygulamasıyla kulüp girişi.",
      en: "ATDSK, Adnan Menderes Boulevard, beside Seyhan Dam Lake, Çukurova / Adana. Taxi, car or maps to the club gate.",
    },
    href: MAPS_URL,
    hrefLabel: { tr: "Haritada aç", en: "Open in maps" },
  },
  {
    id: "parking",
    icon: "car",
    title: { tr: "Otopark", en: "Parking" },
    body: {
      tr: "Giriş Adnan Menderes Bulvarı üzerinden. Kulüp otoparkını kullanın; yoğun maç saatlerinde biraz erken gelin.",
      en: "Enter from Adnan Menderes Boulevard. Use the club car park; arrive a little early on busy session days.",
    },
  },
  {
    id: "tickets",
    icon: "ticket",
    title: { tr: "Bilet ve giriş", en: "Tickets & entry" },
    body: {
      tr: "Bilet detayı yakında. Merkez Kort 1.250–1.500, İpek & Çağla kortları yaklaşık 500 kişilik.",
      en: "Ticket details soon. Centre Court 1,250–1,500; İpek & Çağla courts about 500.",
    },
    href: "https://adanaopen.com/iletisim",
    hrefLabel: { tr: "Bilet sor", en: "Ask about tickets" },
  },
  {
    id: "food",
    icon: "food",
    title: { tr: "Yeme-içme", en: "Food & drink" },
    body: {
      tr: "Food court gün boyu açık. Kulüp terası ayrı. Havuz kenarı oturum alanı turnuva boyunca durur.",
      en: "Food court is open all day. The club terrace sits apart. Poolside seating stays open through the week.",
    },
    href: "/etkinlikler",
    hrefLabel: { tr: "Günün programı", en: "Today’s programme" },
  },
  {
    id: "courts",
    icon: "court",
    title: { tr: "Kortlar", en: "Courts" },
    body: {
      tr: "Merkez Kort, Kort 1 ve Kort 2 maç kortları. Kulüpte toplam 16 kort: 2 kapalı hard, 10 açık hard, 6 toprak.",
      en: "Centre Court, Court 1 and Court 2 host matches. 16 club courts in total: 2 indoor hard, 10 outdoor hard, 6 clay.",
    },
    href: "/maclar",
    hrefLabel: { tr: "Maç panosu", en: "Match board" },
  },
  {
    id: "player",
    icon: "player",
    title: { tr: "Oyuncu ve ekip", en: "Players & teams" },
    body: {
      tr: "Sporcu odaları, Health Center (fitness, spa, masaj) ve antrenman kortları kulüp içinde. Akreditasyon: info@adanaopen.com.",
      en: "Player rooms, Health Center (fitness, spa, massage) and practice courts on site. Accreditation: info@adanaopen.com.",
    },
    href: "mailto:info@adanaopen.com",
    hrefLabel: { tr: "Organizasyona yaz", en: "Email the tournament" },
  },
  {
    id: "heat",
    icon: "sun",
    title: { tr: "İklim ve saatler", en: "Heat & session times" },
    body: {
      tr: "Eylül sonu Adana sıcak olur. Eleme sabah 10:30; ana tabloda ilk top çoğu gün 17:00. Şapka, su, güneş kremi.",
      en: "Late September in Adana is hot. Qualifying from 10:30; most main-draw first balls at 17:00. Hat, water, sunscreen.",
    },
  },
  {
    id: "kids",
    icon: "child",
    title: { tr: "Aile ve çocuk", en: "Families" },
    body: {
      tr: "Cumartesi–Pazar çocuk kulübü gözetmen eşliğinde. 26 Eylül ve 4 Ekim’de Yogakioo Yoga; 3 Ekim’de Cardio Fitness.",
      en: "Supervised kids’ club on Saturday–Sunday. Yogakioo Yoga on 26 September and 4 October; Cardio Fitness on 3 October.",
    },
    href: "/etkinlikler",
    hrefLabel: { tr: "Etkinlikler", en: "Events" },
  },
  {
    id: "press",
    icon: "press",
    title: { tr: "Basın ve ağırlama", en: "Media & hospitality" },
    body: {
      tr: "Basın, protokol tribünü ve sponsor ağırlama için info@adanaopen.com. Teras ve misafir alanları kulüp içinde.",
      en: "Press, protocol stand and hospitality: info@adanaopen.com. Terrace and guest areas are on the club grounds.",
    },
    href: "mailto:info@adanaopen.com",
    hrefLabel: { tr: "Basın masası", en: "Media desk" },
  },
  {
    id: "help",
    icon: "phone",
    title: { tr: "Yardım", en: "Need help" },
    body: {
      tr: "Saha içi sorular için kulüp girişi ve bilgi noktaları. Telefon +90 322 234 11 55 · e-posta info@adanaopen.com.",
      en: "Ask at the club gate and info points. Phone +90 322 234 11 55 · email info@adanaopen.com.",
    },
    href: "tel:+903222341155",
    hrefLabel: { tr: "Ara", en: "Call" },
  },
];

export const FAQS: Faq[] = [
  {
    q: { tr: "Turnuva nerede?", en: "Where is it?" },
    a: {
      tr: "Adana Tenis, Dağ ve Su Sporları Kulübü (ATDSK), Seyhan Baraj Gölü kıyısı, Çukurova / Adana.",
      en: "Adana Tennis, Mountain and Water Sports Club (ATDSK), Seyhan Dam Lake, Çukurova / Adana.",
    },
  },
  {
    q: { tr: "Maç saatleri kesin mi?", en: "Are match times fixed?" },
    a: {
      tr: "Her günün ilk maç saati kesin; sonraki maçlar ardından oynanır. Günlük sıra turnuva haftasında burada güncellenir.",
      en: "First-match time each day is fixed; later matches follow on. The daily order is updated here during tournament week.",
    },
  },
  {
    q: { tr: "Canlı skor nerede?", en: "Where are live scores?" },
    a: {
      tr: "Maçlar ve Canlı sayfalarında. Resmi WTA skorları wtatennis.com üzerinden de takip edilebilir.",
      en: "On Matches and Live. Official WTA scores are also on wtatennis.com.",
    },
  },
  {
    q: { tr: "Canlı yayın var mı?", en: "Is there a livestream?" },
    a: {
      tr: "Link turnuva haftasında Canlı sayfasında ve Instagram @adana.open hesabında paylaşılacak.",
      en: "The link will be posted on Live and Instagram @adana.open during tournament week.",
    },
  },
  {
    q: { tr: "Oyuncular için giriş ayrı mı?", en: "Is there a player entrance?" },
    a: {
      tr: "Akreditasyon ve saha içi dolaşım organizasyon tarafından yönetilir. info@adanaopen.com ile teyit edin.",
      en: "Accreditation and on-site access are handled by the tournament. Confirm via info@adanaopen.com.",
    },
  },
];

export const SOCIAL_LINKS = [
  { id: "instagram", href: INSTAGRAM, label: { tr: "Instagram · @adana.open", en: "Instagram · @adana.open" } },
  { id: "wta", href: WTA_URL, label: { tr: "WTA turnuva sayfası", en: "WTA tournament page" } },
  { id: "web", href: "https://adanaopen.com", label: { tr: "adanaopen.com", en: "adanaopen.com" } },
] as const;

export const MATCH_DAYS = MATCH_PLAN.map((day) => ({
  ...day,
  iso: dateKeyToIso(day.dateKey),
}));

export const PRESS_CONFERENCE = {
  iso: "2026-09-25",
  time: "18:00",
  endMinutes: 19 * 60,
  title: { tr: "Basın toplantısı", en: "Press conference" },
  place: { tr: "Taş Köprü", en: "Taş Köprü" },
  when: { tr: "Cuma · 25 Eylül", en: "Friday · 25 September" },
} as const;

export type TimedEvent = { time: string; title: string; tag: "match" | "music" | "event" };

export function isPressConferenceEvent(item: { title: string }) {
  return /basın toplantısı|press conference/i.test(item.title);
}

export type Attraction = {
  id: string;
  icon: "food" | "photo" | "spark" | "music" | "court";
  title: Copy;
  body: Copy;
};

export const FOOD_COURT_STANDS = [
  "Bun the Bun",
  "Taco Maco",
  "Ico Fried Chicken",
  "Hayat Büfe",
  "Bowl Art",
  "Doğan Kaymaklı",
  "Hüsnü Usta Et Döner",
  "Major Chocolate",
  "Maki",
] as const;

export const ATTRACTIONS: Attraction[] = [
  {
    id: "food",
    icon: "food",
    title: { tr: "Food Court", en: "Food court" },
    body: {
      tr: "Gün boyu açık. Dokuz stand.",
      en: "Open all day. Nine stands.",
    },
  },
  {
    id: "photo",
    icon: "photo",
    title: { tr: "Fotoğraf alanları", en: "Photo spots" },
    body: {
      tr: "Fan Zone ve kort kenarında çekim noktaları. Maskot ve marka duvarları.",
      en: "Fan Zone and court-side photo points. Mascot and brand walls.",
    },
  },
  {
    id: "surprise",
    icon: "spark",
    title: { tr: "Sürpriz yarışmalar", en: "Surprise contests" },
    body: {
      tr: "Fan Zone’da gün içinde çekiliş ve yarışmalar. Saatler günlük programda.",
      en: "Raffles and contests in the Fan Zone. Times are on the daily programme.",
    },
  },
  {
    id: "dj",
    icon: "music",
    title: { tr: "DJ performansı", en: "DJ sets" },
    body: {
      tr: "DJ Yusuf Erdem, çoğu gün 14:00–16:00. 3 Ekim’de sabah Coffee Disco.",
      en: "DJ Yusuf Erdem most days 14:00–16:00. Morning Coffee Disco on 3 October.",
    },
  },
  {
    id: "show",
    icon: "court",
    title: { tr: "Gösteri maçları", en: "Exhibition matches" },
    body: {
      tr: "Ana tablo öncesi Fan Zone gösteri maçı. Tarih günün programında.",
      en: "Fan Zone exhibition before the main session. See the daily programme.",
    },
  },
];

export function istanbulClock(now = Date.now()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: GUIDE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((part) => [part.type, part.value]));
  const iso = `${parts.year}-${parts.month}-${parts.day}`;
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return { iso, minutes, hour: Number(parts.hour), minute: Number(parts.minute) };
}

export function pressConferenceUpcoming(now = Date.now()) {
  const clock = istanbulClock(now);
  if (clock.iso < PRESS_CONFERENCE.iso) return true;
  if (clock.iso > PRESS_CONFERENCE.iso) return false;
  return clock.minutes < PRESS_CONFERENCE.endMinutes;
}

export function eventStartMinutes(time: string) {
  const start = time.split("–")[0].trim();
  const [h, m] = start.split(":").map(Number);
  if (Number.isNaN(h)) return 0;
  return h * 60 + (m || 0);
}

export function eventEndMinutes(time: string, tag: TimedEvent["tag"]) {
  if (time.includes("–")) {
    const end = time.split("–")[1].trim();
    const [h, m] = end.split(":").map(Number);
    return h * 60 + (m || 0);
  }
  return eventStartMinutes(time) + (tag === "match" ? 100 : 60);
}

export type NextMatch = {
  dayIndex: number;
  iso: string;
  isToday: boolean;
  isLive: boolean;
  event: TimedEvent;
};

export function pickNextMatch(days: { events: TimedEvent[] }[], now = Date.now()): NextMatch | null {
  const clock = istanbulClock(now);
  const liveBoard = getLiveData().scoreboard.find((row) => row.status === "live");

  for (let i = 0; i < MATCH_DAYS.length; i += 1) {
    const iso = MATCH_DAYS[i].iso;
    if (iso < clock.iso) continue;
    const matches = (days[i]?.events ?? []).filter((item) => item.tag === "match");
    if (!matches.length) continue;
    const today = iso === clock.iso;
    if (!today) {
      return { dayIndex: i, iso, isToday: false, isLive: false, event: matches[0] };
    }
    const liveEvent = liveBoard ? matches.find((item) => eventStartMinutes(item.time) <= clock.minutes) ?? matches[0] : null;
    if (liveBoard && liveEvent) {
      return { dayIndex: i, iso, isToday: true, isLive: true, event: liveEvent };
    }
    const upcoming = matches.find((item) => eventEndMinutes(item.time, "match") > clock.minutes);
    if (upcoming) {
      const started = eventStartMinutes(upcoming.time) <= clock.minutes;
      return { dayIndex: i, iso, isToday: true, isLive: started, event: upcoming };
    }
  }
  return null;
}

export function featuredDayEvents(days: { events: TimedEvent[] }[], now = Date.now()) {
  const clock = istanbulClock(now);
  const todayIndex = MATCH_DAYS.findIndex((day) => day.iso === clock.iso);
  if (todayIndex >= 0) {
    const events = (days[todayIndex]?.events ?? []).filter((item) => eventEndMinutes(item.time, item.tag) > clock.minutes);
    return { index: todayIndex, iso: clock.iso, isToday: true, events };
  }
  const nextIndex = MATCH_DAYS.findIndex((day) => day.iso > clock.iso);
  if (nextIndex < 0) return null;
  return {
    index: nextIndex,
    iso: MATCH_DAYS[nextIndex].iso,
    isToday: false,
    events: days[nextIndex]?.events ?? [],
  };
}

