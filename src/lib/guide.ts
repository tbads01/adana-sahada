import type { Locale } from "./content";
import live from "./live.json";
import { MATCH_PLAN, isStartTba, type CourtId, type MatchDay, type MatchRound } from "./match-plan";
import { ACCREDITATION_EMAIL, INSTAGRAM, LIVE_STREAM_URL, MAPS_URL, TICKETS_URL, TOURNAMENT_END, TOURNAMENT_START, WTA_URL } from "./site";

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

export function displayStart(start: string, soon: string) {
  return isStartTba(start) ? soon : start;
}

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
      en: "Main-draw direct acceptances are out",
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
    tag: { tr: "Etkinlik", en: "Events" },
    title: {
      tr: "Yoga, DJ ve Cardio Fitness programda",
      en: "Yoga, DJ and Cardio Fitness are on the programme",
    },
    body: {
      tr: "Yogakioo Yoga, DJ Yusuf Erdem ve 3 Ekim Cardio Fitness · Coffee Disco Etkinlikler sayfasında.",
      en: "Yogakioo Yoga, DJ Yusuf Erdem and 3 October Cardio Fitness · Coffee Disco are on Events.",
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
      tr: "Eleme 1. tur 26 Eylül 10:30’da Merkez Kort, Çağla Büyükakçay (Kort A) ve İpek Soylu (Kort B) kortlarında başlar. Ana tablo saatleri Pazartesi’den itibaren yakında belli olacak.",
      en: "Qualifying round one starts 26 September at 10:30 on Centre Court, Çağla Büyükakçay (Court A) and İpek Soylu (Court B). Main-draw times from Monday are still to be confirmed.",
    },
    href: "/maclar",
  },
  {
    id: "tickets",
    date: "2026-09-21",
    pin: true,
    tag: { tr: "Bilet", en: "Tickets" },
    title: {
      tr: "Bilet satışı başladı",
      en: "Tickets are on sale",
    },
    body: {
      tr: "Biletler Biletix’te ve kulüpte. Günlük satılır.",
      en: "Tickets at Biletix and at the club. Sold day by day.",
    },
    href: TICKETS_URL,
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
    id: "tickets",
    icon: "ticket",
    title: { tr: "Bilet al", en: "Buy tickets" },
    body: {
      tr: "Biletix ve kulüp içi satış noktaları. Günlük bilet.",
      en: "Biletix and ticket desks at the club. Sold by the day.",
    },
    href: TICKETS_URL,
    hrefLabel: { tr: "Biletix’te al", en: "Buy on Biletix" },
  },
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
      tr: "Giriş Adnan Menderes Bulvarı üzerindendir. Güvenlik gereği çevre otoparklara veya yakındaki uygun yerlere park edip yaya olarak devam etmeniz tavsiye edilir.",
      en: "Enter from Adnan Menderes Boulevard. For security, park in surrounding car parks or nearby spots and walk the last stretch.",
    },
  },
  {
    id: "food",
    icon: "food",
    title: { tr: "Yeme-içme", en: "Food & drink" },
    body: {
      tr: "Food court gün boyu açık, dokuz stand. Kulüp terası ve havuz kenarı ayrı.",
      en: "Food court all day, nine stands. Club terrace and poolside too.",
    },
    href: "/etkinlikler",
    hrefLabel: { tr: "Günün programı", en: "Today’s programme" },
  },
  {
    id: "courts",
    icon: "court",
    title: { tr: "Kortlar", en: "Courts" },
    body: {
      tr: "Maç kortları: Merkez Kort, Kort A Çağla Büyükakçay Kortu, Kort B İpek Soylu Kortu. Kulüpte toplam 16 kort: 2 kapalı hard, 10 açık hard, 6 toprak.",
      en: "Match courts: Centre Court, Court A Çağla Büyükakçay Court, Court B İpek Soylu Court. 16 club courts in total: 2 indoor hard, 10 outdoor hard, 6 clay.",
    },
    href: "/maclar",
    hrefLabel: { tr: "Maç panosu", en: "Match board" },
  },
  {
    id: "player",
    icon: "player",
    title: { tr: "Oyuncu ve ekip", en: "Players & teams" },
    body: {
      tr: `Sporcu odaları, Health Center (fitness, spa, masaj) ve antrenman kortları kulüp içinde. Akreditasyon: ${ACCREDITATION_EMAIL}.`,
      en: `Player rooms, Health Center (fitness, spa, massage) and practice courts on site. Accreditation: ${ACCREDITATION_EMAIL}.`,
    },
    href: `mailto:${ACCREDITATION_EMAIL}`,
    hrefLabel: { tr: "Organizasyona yaz", en: "Email the tournament" },
  },
  {
    id: "heat",
    icon: "sun",
    title: { tr: "İklim ve saatler", en: "Heat & session times" },
    body: {
      tr: "Adana sıcak. Kapı 10:30. Şapka, su, güneş kremi.",
      en: "Adana is hot. Gates 10:30. Hat, water, sunscreen.",
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
      tr: `Basın, protokol tribünü ve sponsor ağırlama için ${ACCREDITATION_EMAIL}. Teras ve misafir alanları kulüp içinde.`,
      en: `Press, protocol stand and hospitality: ${ACCREDITATION_EMAIL}. Terrace and guest areas are on the club grounds.`,
    },
    href: `mailto:${ACCREDITATION_EMAIL}`,
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
    q: { tr: "Giriş ücretsiz mi?", en: "Is entry free?" },
    a: {
      tr: "Etkinlik alanlarına giriş ücretsiz. Fan Zone, food court ve yan etkinlikler biletsiz. Maç izlemek için o günün bileti gerekir. Bilet tribünde koltuk garantilemez; yerler sınırlı, erken gelin.",
      en: "Event areas are free — Fan Zone, food court, side events. Watching matches needs that day’s ticket. A ticket does not guarantee a seat; come early.",
    },
  },
  {
    q: { tr: "Bilet nereden alınır?", en: "Where do I buy tickets?" },
    a: {
      tr: "Biletix’te ve kulüp içi satış noktalarında. Ana sayfadaki Bilet al, Adana Open WTA 125 grubunu açar.",
      en: "On Biletix and at desks in the club. The Buy tickets button opens the Adana Open WTA 125 group.",
    },
  },
  {
    q: { tr: "Biletler günlük mü?", en: "Are tickets sold by the day?" },
    a: {
      tr: "Evet. Bilet yalnızca o günün maçlarına girer; başka güne geçmez. Eleme ve ana tablo aynı kural.",
      en: "Yes. A ticket is only for that day’s matches. Same rule for qualifying and main draw.",
    },
  },
  {
    q: { tr: "Maç saatleri kesin mi?", en: "Are match times fixed?" },
    a: {
      tr: "Şu anki plan bu, saatler değişebilir. Eleme 10:30. Pazartesi’den ana tablo henüz net değil; değişince burada güncellenir.",
      en: "This is the current plan; times can shift. Qualifying 10:30. Main-draw times from Monday still open; they update here.",
    },
  },
  {
    q: { tr: "Kapılar ne zaman açılır?", en: "When do the gates open?" },
    a: {
      tr: "Saat 10:30’dan itibaren.",
      en: "From 10:30.",
    },
  },
  {
    q: { tr: "Turnuva ne zaman, nerede?", en: "When and where is it?" },
    a: {
      tr: "26 Eylül – 4 Ekim, ATDSK. Adnan Menderes Bulvarı, Seyhan Baraj Gölü yanı, Çukurova.",
      en: "26 September – 4 October at ATDSK, Adnan Menderes Boulevard, beside Seyhan Dam Lake, Çukurova.",
    },
  },
  {
    q: { tr: "Nasıl giderim, otopark var mı?", en: "How do I get there, and is there parking?" },
    a: {
      tr: "Giriş Adnan Menderes Bulvarı. Güvenlik için çevre otoparklara veya yakına park edip yaya devam edin.",
      en: "Gate on Adnan Menderes Boulevard. For security, park nearby and walk the last stretch.",
    },
  },
  {
    q: { tr: "Yeme-içme var mı?", en: "Is there food and drink?" },
    a: {
      tr: "Food court gün boyu, dokuz stand. Kulüp terası ve havuz kenarı da açık. Standlar Saha ve Etkinlikler’de.",
      en: "Food court all day, nine stands. Terrace and poolside too. Names are on Venue and Events.",
    },
  },
  {
    q: { tr: "Kort A ve Kort B hangisi?", en: "Which courts are Court A and Court B?" },
    a: {
      tr: "Ana kort Merkez Kort. Kort A Çağla Büyükakçay Kortu, Kort B İpek Soylu Kortu.",
      en: "Centre Court is the main court. Court A is Çağla Büyükakçay, Court B is İpek Soylu.",
    },
  },
  {
    q: { tr: "Yağmur olursa ne olur?", en: "What if it rains?" },
    a: {
      tr: "Kararı baş hakem verir. Saat genelde ertelenir veya maç kapalı korta alınır.",
      en: "The chief referee decides. Play is usually delayed or moved indoors.",
    },
  },
  {
    q: { tr: "Canlı skor ve yayın nerede?", en: "Where are live scores and the stream?" },
    a: {
      tr: "Skor Maçlar ve Canlı’da. Yayın linki turnuva haftasında Canlı ve Instagram @adana.open’da.",
      en: "Scores on Matches and Live. Stream link during tournament week on Live and Instagram @adana.open.",
    },
  },
  {
    q: { tr: "Telefona maç saati düşer mi?", en: "Will match times come to my phone?" },
    a: {
      tr: "Evet. Ana sayfada Bildirim izni ver’e bir kez basın.",
      en: "Yes. Tap Allow notifications once on the home screen.",
    },
  },
  {
    q: { tr: "Aile ve çocuk için ne var?", en: "What’s on for families?" },
    a: {
      tr: "Cumartesi–pazar çocuk kulübü. 26 Eylül ve 4 Ekim’de yoga, 3 Ekim’de Cardio Fitness. Program Etkinlikler’de.",
      en: "Kids’ club Saturday–Sunday. Yoga on 26 September and 4 October; Cardio Fitness on 3 October. Times on Events.",
    },
  },
  {
    q: { tr: "Oyuncu ve basın girişi ayrı mı?", en: "Is there a separate player or media entrance?" },
    a: {
      tr: `Evet, akreditasyonla. ${ACCREDITATION_EMAIL}`,
      en: `Yes, by accreditation. ${ACCREDITATION_EMAIL}`,
    },
  },
];

export const SOCIAL_LINKS = [
  { id: "tickets", href: TICKETS_URL, label: { tr: "Biletix · Bilet al", en: "Biletix · Buy tickets" } },
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
      tr: "Fan Zone ve kort kenarı.",
      en: "Fan Zone and court-side.",
    },
  },
  {
    id: "surprise",
    icon: "spark",
    title: { tr: "Sürpriz yarışmalar", en: "Surprise contests" },
    body: {
      tr: "Fan Zone’da çekiliş ve yarışmalar. Saatler günlük programda.",
      en: "Raffles and contests in the Fan Zone. Times on the daily programme.",
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

