import type { Locale } from "./content";
import live from "./live.json";
import { MATCH_PLAN, isStartTba, liveOrder, type CourtId, type MatchDay, type MatchRound } from "./match-plan";
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
  const clock = istanbulClock(now);
  const playable = MATCH_PLAN.filter((day) => day.courts.length);
  for (const day of playable) {
    const iso = dateKeyToIso(day.dateKey);
    if (iso < clock.iso) continue;
    const isToday = iso === clock.iso;
    const named = day.courts.some((court) => court.matches?.length);
    if (named) {
      const nowMin = isToday ? clock.minutes : null;
      if (!liveOrder(day, nowMin).length) continue;
    }
    return { day, iso, isToday };
  }
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
      tr: "Basın toplantısı 25 Eylül Cuma, Taş Köprü",
      en: "Press conference Friday 25 September at Taş Köprü",
    },
    body: {
      tr: "Adana Open basın toplantısı 25 Eylül Cuma saat 18:00’de Taş Köprü’de yapılır. Eleme maçları ertesi gün saat 10:30’da ATDSK’de başlar.",
      en: "The Adana Open press conference takes place on Friday 25 September at 18:00 on Taş Köprü. Qualifying begins the next morning at 10:30 at ATDSK.",
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
      en: "Main-draw direct acceptances announced",
    },
    body: {
      tr: "Ana tabloya doğrudan kabul edilen 23 oyuncu açıklandı. Dört wildcard, bir special exempt ve dört eleme kazananı daha sonra duyurulacaktır.",
      en: "Twenty-three players have been accepted directly into the main draw. Four wildcards, one special exempt and four qualifying winners will be announced later.",
    },
    href: "/oyuncular",
  },
  {
    id: "side-events",
    date: "2026-09-10",
    tag: { tr: "Etkinlik", en: "Events" },
    title: {
      tr: "Yoga, DJ ve Cardio Fitness programda",
      en: "Yoga, DJ and Cardio Fitness on the programme",
    },
    body: {
      tr: "Yogakioo Yoga, DJ Yusuf Erdem ve 3 Ekim Cardio Fitness · Coffee Disco seansları Etkinlikler sayfasında yayımlanmıştır.",
      en: "Yogakioo Yoga, DJ Yusuf Erdem and the 3 October Cardio Fitness · Coffee Disco sessions are listed on the Events page.",
    },
    href: "/etkinlikler",
  },
  {
    id: "oop-26",
    date: "2026-09-25",
    tag: { tr: "Maç", en: "Matches" },
    title: {
      tr: "Cumartesi eleme programı açıklandı",
      en: "Saturday’s qualifying order of play is out",
    },
    body: {
      tr: "Eleme 1. tur 26 Eylül saat 10:30’da Merkez Kort, Çağla Büyükakçay Kortu ve İpek Soylu Kortu’nda başlar. Çekişmeler Maçlar sayfasında.",
      en: "Qualifying round one starts on 26 September at 10:30 on Centre Court, Çağla Büyükakçay Court and İpek Soylu Court. The order of play is on Matches.",
    },
    href: "/maclar",
  },
  {
    id: "oop-27",
    date: "2026-09-26",
    pin: true,
    tag: { tr: "Maç", en: "Matches" },
    title: {
      tr: "Pazar eleme programı açıklandı",
      en: "Sunday’s qualifying order of play is out",
    },
    body: {
      tr: "Eleme finalleri 27 Eylül’de Merkez Kort’ta saat 15:00’de, İpek Soylu Kortu’nda saat 16:00’da başlar. Çekişmeler Maçlar sayfasında.",
      en: "Qualifying finals on 27 September start at 15:00 on Centre Court and at 16:00 on İpek Soylu Court. The order of play is on Matches.",
    },
    href: "/maclar",
  },
  {
    id: "qualifying",
    date: "2026-09-08",
    tag: { tr: "Maç", en: "Matches" },
    title: {
      tr: "Eleme maçları 26–27 Eylül, ilk top 10:30",
      en: "Qualifying 26–27 September, first ball 10:30",
    },
    body: {
      tr: "Eleme 1. tur 26 Eylül saat 10:30’da Merkez Kort, Çağla Büyükakçay Kortu (Kort A) ve İpek Soylu Kortu’nda (Kort B) başlar. Ana tablo saatleri 28 Eylül’den itibaren duyurulacaktır.",
      en: "Qualifying round one begins on 26 September at 10:30 on Centre Court, Çağla Büyükakçay Court (Court A) and İpek Soylu Court (Court B). Main-draw start times will be announced from 28 September.",
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
      tr: "Günlük maç biletleri Biletix üzerinden ve kulüp satış noktalarından alınabilir.",
      en: "Daily match tickets are on sale at Biletix and at ticket desks on the club grounds.",
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
      tr: "Günlük biletler Biletix üzerinden ve kulüp içi satış noktalarından alınabilir.",
      en: "Daily tickets are available on Biletix and at ticket desks in the club.",
    },
    href: TICKETS_URL,
    hrefLabel: { tr: "Biletix’te al", en: "Buy on Biletix" },
  },
  {
    id: "venue",
    icon: "pin",
    title: { tr: "Nasıl gelirim?", en: "How to get there" },
    body: {
      tr: "ATDSK, Adnan Menderes Bulvarı, Seyhan Baraj Gölü yanı, Çukurova / Adana. Tesise taksi, özel araç veya harita uygulamasıyla ulaşabilirsiniz.",
      en: "ATDSK is on Adnan Menderes Boulevard, beside Seyhan Dam Lake, Çukurova / Adana. You can reach the club by taxi, car or maps.",
    },
    href: MAPS_URL,
    hrefLabel: { tr: "Haritada aç", en: "Open in maps" },
  },
  {
    id: "parking",
    icon: "car",
    title: { tr: "Otopark", en: "Parking" },
    body: {
      tr: "Giriş Adnan Menderes Bulvarı üzerindedir. Güvenlik nedeniyle çevre otoparklara veya yakındaki uygun yerlere park edip tesise yaya devam etmeniz önerilir.",
      en: "The entrance is on Adnan Menderes Boulevard. For security reasons, please park in surrounding car parks or nearby spaces and walk the last stretch.",
    },
  },
  {
    id: "food",
    icon: "food",
    title: { tr: "Yeme-içme", en: "Food & drink" },
    body: {
      tr: "Food court gün boyunca açıktır. Tesiste dokuz stand ile kulüp terası ve havuz kenarı bulunur.",
      en: "The food court is open throughout the day. There are nine stands, plus the club terrace and poolside.",
    },
    href: "/etkinlikler",
    hrefLabel: { tr: "Günün programı", en: "Today’s programme" },
  },
  {
    id: "courts",
    icon: "court",
    title: { tr: "Kortlar", en: "Courts" },
    body: {
      tr: "Maç kortları Merkez Kort, Kort A (Çağla Büyükakçay Kortu) ve Kort B’dir (İpek Soylu Kortu). Kulüpte toplam 16 kort bulunur: 2 kapalı hard, 10 açık hard ve 6 toprak.",
      en: "Match courts are Centre Court, Court A (Çağla Büyükakçay Court) and Court B (İpek Soylu Court). The club has 16 courts in total: 2 indoor hard, 10 outdoor hard and 6 clay.",
    },
    href: "/maclar",
    hrefLabel: { tr: "Maç panosu", en: "Match board" },
  },
  {
    id: "player",
    icon: "player",
    title: { tr: "Oyuncu ve ekip", en: "Players & teams" },
    body: {
      tr: `Sporcu odaları, Health Center (fitness, spa, masaj) ve antrenman kortları kulüp içindedir. Akreditasyon başvuruları ${ACCREDITATION_EMAIL} adresine gönderilir.`,
      en: `Player rooms, the Health Center (fitness, spa, massage) and practice courts are on site. Accreditation requests: ${ACCREDITATION_EMAIL}.`,
    },
    href: `mailto:${ACCREDITATION_EMAIL}`,
    hrefLabel: { tr: "Organizasyona yaz", en: "Email the tournament" },
  },
  {
    id: "heat",
    icon: "sun",
    title: { tr: "İklim ve saatler", en: "Heat & session times" },
    body: {
      tr: "Adana’da hava sıcak olabilir. Tesis kapıları saat 10:30’da açılır. Şapka, su ve güneş kremi getirmenizi öneririz.",
      en: "Adana can be hot. Gates open at 10:30. Please bring a hat, water and sunscreen.",
    },
  },
  {
    id: "kids",
    icon: "child",
    title: { tr: "Aile ve çocuk", en: "Families" },
    body: {
      tr: "Cumartesi ve pazar günleri gözetmen eşliğinde çocuk kulübü hizmet verir. 26 Eylül ve 4 Ekim’de Yogakioo Yoga, 3 Ekim’de Cardio Fitness programdadır.",
      en: "A supervised children’s club is open on Saturdays and Sundays. Yogakioo Yoga is on 26 September and 4 October; Cardio Fitness is on 3 October.",
    },
    href: "/etkinlikler",
    hrefLabel: { tr: "Etkinlikler", en: "Events" },
  },
  {
    id: "press",
    icon: "press",
    title: { tr: "Basın ve ağırlama", en: "Media & hospitality" },
    body: {
      tr: `Basın, protokol tribünü ve sponsor ağırlama için ${ACCREDITATION_EMAIL} adresine yazabilirsiniz. Teras ve misafir alanları kulüp içindedir.`,
      en: `For press, the protocol stand and hospitality, write to ${ACCREDITATION_EMAIL}. Terrace and guest areas are on the club grounds.`,
    },
    href: `mailto:${ACCREDITATION_EMAIL}`,
    hrefLabel: { tr: "Basın masası", en: "Media desk" },
  },
  {
    id: "help",
    icon: "phone",
    title: { tr: "Yardım", en: "Need help" },
    body: {
      tr: "Saha içi sorular için kulüp girişi ve bilgi noktalarına başvurabilirsiniz. Telefon: +90 322 234 11 55. E-posta: info@adanaopen.com.",
      en: "For on-site questions, please ask at the club gate and information points. Phone: +90 322 234 11 55. Email: info@adanaopen.com.",
    },
    href: "tel:+903222341155",
    hrefLabel: { tr: "Ara", en: "Call" },
  },
];

export const FAQS: Faq[] = [
  {
    q: { tr: "Giriş ücretsiz mi?", en: "Is entry free?" },
    a: {
      tr: "Etkinlik alanlarına giriş ücretsizdir. Fan Zone, food court ve yan etkinlikler için bilet gerekmez. Maç izlemek için ilgili günün bileti alınmalıdır. Bilet tribünde koltuk garantisi vermez; yerler sınırlıdır, erken gelmenizi öneririz.",
      en: "Entry to the event areas is free. The Fan Zone, food court and side events do not require a ticket. A ticket for that day is required to watch matches. A ticket does not guarantee a seat; capacity is limited, so please arrive early.",
    },
  },
  {
    q: { tr: "Bilet nereden alınır?", en: "Where do I buy tickets?" },
    a: {
      tr: "Günlük biletler Biletix üzerinden ve kulüp içi satış noktalarından alınabilir. Ana sayfadaki Bilet al düğmesi Adana Open WTA 125 bilet grubunu açar.",
      en: "Daily tickets are available on Biletix and at ticket desks in the club. The Buy tickets button on the home screen opens the Adana Open WTA 125 listing.",
    },
  },
  {
    q: { tr: "Biletler günlük mü?", en: "Are tickets sold by the day?" },
    a: {
      tr: "Evet. Her bilet yalnızca satın alındığı günün maçları için geçerlidir; başka bir güne aktarılamaz. Aynı kural eleme ve ana tablo için geçerlidir.",
      en: "Yes. Each ticket is valid only for the matches on that day and cannot be used on another date. The same rule applies to qualifying and the main draw.",
    },
  },
  {
    q: { tr: "Maç saatleri kesin mi?", en: "Are match times fixed?" },
    a: {
      tr: "Maç saatleri günün koşullarına göre değişebilir. Eleme 1. tur Cumartesi saat 10:30’da, eleme finalleri Pazar saat 15:00’de başlar. Ana tablo saatleri 28 Eylül’den itibaren bu sitede duyurulur.",
      en: "Match times may change according to conditions on the day. Qualifying round one begins Saturday at 10:30; qualifying finals begin Sunday at 15:00. Main-draw start times will be published on this site from 28 September.",
    },
  },
  {
    q: { tr: "Kapılar ne zaman açılır?", en: "When do the gates open?" },
    a: {
      tr: "Tesis kapıları saat 10:30’da açılır.",
      en: "The gates open at 10:30.",
    },
  },
  {
    q: { tr: "Turnuva ne zaman, nerede?", en: "When and where is it?" },
    a: {
      tr: "Adana Open, 26 Eylül – 4 Ekim 2026 tarihleri arasında Adana Tenis, Dağ ve Su Sporları Kulübü’nde (ATDSK) oynanır. Adres: Adnan Menderes Bulvarı, Seyhan Baraj Gölü yanı, Çukurova.",
      en: "Adana Open takes place from 26 September to 4 October 2026 at Adana Tennis, Mountain and Water Sports Club (ATDSK), Adnan Menderes Boulevard, beside Seyhan Dam Lake, Çukurova.",
    },
  },
  {
    q: { tr: "Nasıl giderim, otopark var mı?", en: "How do I get there, and is there parking?" },
    a: {
      tr: "Giriş Adnan Menderes Bulvarı üzerindedir. Güvenlik nedeniyle çevre otoparklara veya yakındaki uygun yerlere park edip tesise yaya devam etmeniz önerilir.",
      en: "The entrance is on Adnan Menderes Boulevard. For security reasons, please park in surrounding car parks or nearby spaces and walk the last stretch.",
    },
  },
  {
    q: { tr: "Yeme-içme var mı?", en: "Is there food and drink?" },
    a: {
      tr: "Food court gün boyunca açıktır; tesiste dokuz stand bulunur. Kulüp terası ve havuz kenarı da hizmet verir. Stand listesi Saha ve Etkinlikler sayfalarındadır.",
      en: "The food court is open throughout the day, with nine stands on site. The club terrace and poolside are also open. The full list is on the Venue and Events pages.",
    },
  },
  {
    q: { tr: "Kort A ve Kort B hangisi?", en: "Which courts are Court A and Court B?" },
    a: {
      tr: "Ana kort Merkez Kort’tur. Kort A Çağla Büyükakçay Kortu, Kort B İpek Soylu Kortu’dur.",
      en: "The main court is Centre Court. Court A is Çağla Büyükakçay Court; Court B is İpek Soylu Court.",
    },
  },
  {
    q: { tr: "Yağmur olursa ne olur?", en: "What if it rains?" },
    a: {
      tr: "Kararı baş hakem verir. Maçlar genellikle ertelenir veya kapalı korta alınır.",
      en: "The decision rests with the chief referee. Play is usually delayed or moved to an indoor court.",
    },
  },
  {
    q: { tr: "Canlı skor ve yayın nerede?", en: "Where are live scores and the stream?" },
    a: {
      tr: "Skorlar Maçlar ve Canlı sayfalarında yer alır. Yayın bağlantısı turnuva haftasında Canlı sayfasında ve Instagram’da (@adana.open) paylaşılır.",
      en: "Scores appear on the Matches and Live pages. The stream link is published during tournament week on Live and on Instagram (@adana.open).",
    },
  },
  {
    q: { tr: "Telefona maç saati düşer mi?", en: "Will match times come to my phone?" },
    a: {
      tr: "Evet. Ana sayfada bir kez «Bildirimlere izin ver»e basmanız yeterlidir.",
      en: "Yes. Tap Allow notifications once on the home screen.",
    },
  },
  {
    q: { tr: "Aile ve çocuk için ne var?", en: "What’s on for families?" },
    a: {
      tr: "Cumartesi ve pazar günleri gözetmen eşliğinde çocuk kulübü vardır. 26 Eylül ve 4 Ekim’de yoga, 3 Ekim’de Cardio Fitness programdadır. Saatler Etkinlikler sayfasındadır.",
      en: "A supervised children’s club is open on Saturdays and Sundays. Yoga is on 26 September and 4 October; Cardio Fitness is on 3 October. Times are listed on Events.",
    },
  },
  {
    q: { tr: "Oyuncu ve basın girişi ayrı mı?", en: "Is there a separate player or media entrance?" },
    a: {
      tr: `Evet. Oyuncu, ekip ve basın girişi akreditasyonla yapılır. Başvuru: ${ACCREDITATION_EMAIL}`,
      en: `Yes. Player, team and media access is by accreditation. Applications: ${ACCREDITATION_EMAIL}`,
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

export function namedBoardFor(now = Date.now()) {
  const clock = istanbulClock(now);
  for (const day of MATCH_DAYS) {
    if (day.iso < clock.iso) continue;
    if (!day.courts.some((court) => court.matches?.length)) continue;
    const isToday = day.iso === clock.iso;
    const nowMin = isToday ? clock.minutes : null;
    const plays = liveOrder(day, nowMin);
    if (!plays.length) continue;
    return { day, iso: day.iso, isToday, nowMin, plays };
  }
  return null;
}

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
      tr: "Gün boyunca açıktır. Tesiste dokuz stand bulunur.",
      en: "Open throughout the day, with nine stands on site.",
    },
  },
  {
    id: "photo",
    icon: "photo",
    title: { tr: "Fotoğraf alanları", en: "Photo spots" },
    body: {
      tr: "Fan Zone ve kort kenarında fotoğraf noktaları vardır.",
      en: "Photo spots are in the Fan Zone and beside the courts.",
    },
  },
  {
    id: "surprise",
    icon: "spark",
    title: { tr: "Sürpriz yarışmalar", en: "Surprise contests" },
    body: {
      tr: "Fan Zone’da çekiliş ve yarışmalar düzenlenir. Saatler günlük programda yer alır.",
      en: "Raffles and contests take place in the Fan Zone. Times are listed on the daily programme.",
    },
  },
  {
    id: "dj",
    icon: "music",
    title: { tr: "DJ performansı", en: "DJ sets" },
    body: {
      tr: "DJ Yusuf Erdem her gün saat 15:00’den sonra sahne alır. 3 Ekim sabahı Coffee Disco vardır.",
      en: "DJ Yusuf Erdem performs every day from 15:00. Coffee Disco is on the morning of 3 October.",
    },
  },
  {
    id: "show",
    icon: "court",
    title: { tr: "Gösteri maçları", en: "Exhibition matches" },
    body: {
      tr: "Ana tablo öncesinde Fan Zone’da gösteri maçı oynanır. Tarih günlük programda yer alır.",
      en: "An exhibition match is played in the Fan Zone before the main session. The date is on the daily programme.",
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
  if (/sonrası|onwards/i.test(time)) return 22 * 60;
  if (time.includes("–")) {
    const end = time.split("–")[1].trim();
    const [h, m] = end.split(":").map(Number);
    if (!end || Number.isNaN(h)) return 22 * 60;
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

