"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ago, Bar, Card, delta, fmt, Kpi, pct, when } from "./admin-ui";

export type TrafficDay = {
  iso: string;
  weekday: string;
  label: string;
  views: number;
  unique: number;
  tickets: number;
  hours: number[];
  locales: { tr: number; en: number };
  pages: { path?: string; id?: string; label: string; views: number }[];
  refs: { id: string; label: string; views: number }[];
  ticketPages: { path?: string; id?: string; label: string; views: number }[];
};

export type TrafficLive = {
  now: number;
  peak: number;
  locales: { tr: number; en: number };
  pages: { path: string; label: string; count: number }[];
  visitors: { t: number; path: string; label: string; locale: string; ref: string }[];
};

export type AdminTraffic = {
  today: { views: number; unique: number; tickets: number };
  total: { views: number; unique: number; tickets: number };
  days: TrafficDay[];
  recent: { t: number; kind: "view" | "ticket"; path: string; label: string; locale: string; ref: string }[];
  live: TrafficLive;
};

type Span = "day" | "7" | "14" | "all";

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00+03:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function emptyRollup() {
  return {
    views: 0,
    unique: 0,
    tickets: 0,
    hours: Array.from({ length: 24 }, () => 0),
    locales: { tr: 0, en: 0 },
    pages: new Map<string, { label: string; views: number }>(),
    refs: new Map<string, { label: string; views: number }>(),
    ticketPages: new Map<string, { label: string; views: number }>(),
  };
}

function mergeDays(rows: TrafficDay[]) {
  const out = emptyRollup();
  for (const day of rows) {
    out.views += day.views;
    out.unique += day.unique;
    out.tickets += day.tickets;
    out.locales.tr += day.locales.tr;
    out.locales.en += day.locales.en;
    day.hours.forEach((count, hour) => {
      out.hours[hour] += count;
    });
    for (const page of day.pages) {
      const key = page.path ?? page.id ?? page.label;
      const prev = out.pages.get(key);
      out.pages.set(key, { label: page.label, views: (prev?.views ?? 0) + page.views });
    }
    for (const row of day.refs) {
      const prev = out.refs.get(row.id);
      out.refs.set(row.id, { label: row.label, views: (prev?.views ?? 0) + row.views });
    }
    for (const page of day.ticketPages) {
      const key = page.path ?? page.id ?? page.label;
      const prev = out.ticketPages.get(key);
      out.ticketPages.set(key, { label: page.label, views: (prev?.views ?? 0) + page.views });
    }
  }
  const sort = (map: Map<string, { label: string; views: number }>) =>
    [...map.entries()]
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => b.views - a.views);
  return {
    views: out.views,
    unique: out.unique,
    tickets: out.tickets,
    hours: out.hours,
    locales: out.locales,
    pages: sort(out.pages),
    refs: sort(out.refs),
    ticketPages: sort(out.ticketPages),
  };
}

function periodLabel(span: Span, rows: TrafficDay[], today: string) {
  if (!rows.length) return "Kayıt yok";
  if (span === "all") return "Tüm kayıt";
  if (span === "7") return "Son 7 gün";
  if (span === "14") return "Son 14 gün";
  const day = rows[0];
  if (day.iso === today) return `Bugün · ${day.label}`;
  return `${day.weekday} · ${day.label}`;
}

export function AdminStats({
  today,
  generatedAt,
  traffic,
}: {
  today: string;
  generatedAt: number;
  traffic: AdminTraffic;
}) {
  const [iso, setIso] = useState(today);
  const [span, setSpan] = useState<Span>("day");
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (span === "day" && (iso === "" || iso > today)) setIso(today);
  }, [today, iso, span]);

  const selectedIso = span === "day" && iso > today ? today : iso || today;
  const byIso = useMemo(() => new Map(traffic.days.map((day) => [day.iso, day])), [traffic.days]);
  const firstIso = traffic.days[0]?.iso ?? today;
  const lastIso = traffic.days.at(-1)?.iso ?? today;

  const selectedDays = useMemo(() => {
    if (span === "all") return traffic.days;
    if (span === "7" || span === "14") {
      const end = selectedIso > today ? today : selectedIso;
      const start = addDays(end, span === "7" ? -6 : -13);
      return traffic.days.filter((day) => day.iso >= start && day.iso <= end);
    }
    const day = byIso.get(selectedIso);
    return day ? [day] : [];
  }, [span, selectedIso, today, traffic.days, byIso]);

  const previousDays = useMemo(() => {
    if (span === "all" || !selectedDays.length) return [];
    const start = selectedDays[0].iso;
    const len = selectedDays.length;
    const prevStart = addDays(start, -len);
    const prevEnd = addDays(start, -1);
    return traffic.days.filter((day) => day.iso >= prevStart && day.iso <= prevEnd);
  }, [span, selectedDays, traffic.days]);

  const current = useMemo(() => mergeDays(selectedDays), [selectedDays]);
  const previous = useMemo(() => mergeDays(previousDays), [previousDays]);
  const maxDayViews = Math.max(1, ...traffic.days.map((day) => day.views));
  const maxHour = Math.max(1, ...current.hours);
  const maxPage = current.pages[0]?.views ?? 0;
  const maxRef = current.refs[0]?.views ?? 0;
  const maxTicketPage = current.ticketPages[0]?.views ?? 0;
  const maxLivePage = traffic.live.pages[0]?.count ?? 0;
  const localeTotal = current.locales.tr + current.locales.en;
  const rangeStart = Date.parse(`${(selectedDays[0]?.iso ?? selectedIso)}T00:00:00+03:00`);
  const rangeEnd = Date.parse(`${(selectedDays.at(-1)?.iso ?? selectedIso)}T23:59:59.999+03:00`);
  const recent = traffic.recent.filter((row) => row.t >= rangeStart && row.t <= rangeEnd).slice(0, 16);

  useEffect(() => {
    const node = stripRef.current?.querySelector(`[data-iso="${selectedIso}"]`);
    if (node instanceof HTMLElement) {
      node.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [selectedIso, traffic.days.length]);

  function pickDay(next: string) {
    setSpan("day");
    setIso(next < firstIso ? firstIso : next > today ? today : next);
  }

  const chips: { id: Span | "yesterday"; label: string }[] = [
    { id: "day", label: "Bugün" },
    { id: "yesterday", label: "Dün" },
    { id: "7", label: "7 gün" },
    { id: "14", label: "14 gün" },
    { id: "all", label: "Tümü" },
  ];

  function onChip(id: (typeof chips)[number]["id"]) {
    if (id === "yesterday") {
      pickDay(addDays(today, -1));
      return;
    }
    if (id === "day") {
      pickDay(today);
      return;
    }
    setSpan(id);
    setIso(today);
  }

  const chipActive = (id: (typeof chips)[number]["id"]) => {
    if (id === "yesterday") return span === "day" && selectedIso === addDays(today, -1);
    if (id === "day") return span === "day" && selectedIso === today;
    return span === id;
  };

  return (
    <>
      <Card id="anlik">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-[0.68rem] font-bold tracking-[0.12em] text-green uppercase">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green" />
              </span>
              Canlı ziyaretçi
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold">Şu an sahada</h2>
          </div>
          <p className="text-[0.72rem] text-paper/45">8 sn’de bir yenilenir</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <Kpi label="Anlık kişi" value={fmt(traffic.live.now)} hint={traffic.live.peak ? `Bugünkü tepe ${fmt(traffic.live.peak)}` : "Henüz tepe yok"} />
          <Kpi label="Türkçe" value={fmt(traffic.live.locales.tr)} hint="Açık oturum" />
          <Kpi label="English" value={fmt(traffic.live.locales.en)} hint="Open session" />
          <Kpi label="Bugün bilet" value={fmt(traffic.today.tickets)} hint={`${fmt(traffic.today.unique)} tekil ziyaret`} />
        </div>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Şu an hangi sayfa</p>
            {traffic.live.pages.length ? (
              traffic.live.pages.map((page) => <Bar key={page.path} value={page.count} max={maxLivePage} label={page.label} />)
            ) : (
              <p className="text-sm text-paper/45">Şu an açık oturum yok. Saha uygulamasını açınca burada görünür.</p>
            )}
          </div>
          <div>
            <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Açık oturumlar</p>
            <ul className="mt-2 space-y-1.5">
              {traffic.live.visitors.length ? (
                traffic.live.visitors.map((row, i) => (
                  <li key={`${row.t}-${row.path}-${i}`} className="flex items-center justify-between gap-3 text-[0.78rem]">
                    <span className="min-w-0 truncate font-bold">{row.label}</span>
                    <span className="shrink-0 text-paper/45">
                      {row.ref} · {row.locale.toUpperCase()} · {ago(row.t, generatedAt)}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-paper/45">Kimse bağlı değil.</li>
              )}
            </ul>
          </div>
        </div>
      </Card>

      <Card id="istatistik">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-xl font-extrabold">İstatistik</h2>
            <p className="mt-1 text-sm text-paper/50">{periodLabel(span, selectedDays, today)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => pickDay(addDays(selectedIso, -1))}
              disabled={span !== "day" || selectedIso <= firstIso}
              className="rounded-full bg-white/10 px-3 py-1.5 text-[0.72rem] font-bold disabled:opacity-30"
            >
              ←
            </button>
            <input
              type="date"
              value={selectedIso}
              min={firstIso}
              max={today}
              onChange={(e) => {
                if (e.target.value) pickDay(e.target.value);
              }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.78rem] font-bold outline-none focus:border-yellow"
            />
            <button
              type="button"
              onClick={() => pickDay(addDays(selectedIso, 1))}
              disabled={span !== "day" || selectedIso >= today}
              className="rounded-full bg-white/10 px-3 py-1.5 text-[0.72rem] font-bold disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-1 overflow-x-auto">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onChip(chip.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[0.72rem] font-bold ${
                chipActive(chip.id) ? "bg-yellow text-ink" : "bg-white/10 text-paper/70"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div ref={stripRef} className="mt-4 flex gap-1 overflow-x-auto pb-1">
          {traffic.days.map((day) => {
            const active = span === "day" ? day.iso === selectedIso : selectedDays.some((row) => row.iso === day.iso);
            return (
              <button
                key={day.iso}
                type="button"
                data-iso={day.iso}
                onClick={() => pickDay(day.iso)}
                className={`flex w-12 shrink-0 flex-col items-center rounded-2xl px-1 py-2 ${
                  active ? "bg-yellow text-ink" : "bg-white/5 text-paper/70"
                }`}
              >
                <span className="text-[0.58rem] font-bold uppercase">{day.weekday}</span>
                <span className="font-display text-lg font-extrabold leading-none">{day.iso.slice(8)}</span>
                <span className="mt-1 flex h-10 w-3 items-end rounded-full bg-black/10">
                  <span
                    className={`w-full rounded-full ${active ? "bg-ink" : "bg-yellow"}`}
                    style={{ height: `${Math.max(day.views ? 12 : 3, Math.round((day.views / maxDayViews) * 100))}%` }}
                  />
                </span>
                <span className="mt-1 text-[0.58rem] font-bold">{fmt(day.views)}</span>
                {day.tickets ? <span className="text-[0.55rem] font-bold">{fmt(day.tickets)} bilet</span> : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <Kpi
            label="Görüntüleme"
            value={fmt(current.views)}
            hint={span === "all" ? `Kayıt ${fmt(traffic.total.views)}` : delta(current.views, previous.views)}
          />
          <Kpi
            label="Tekil"
            value={fmt(current.unique)}
            hint={span === "day" ? "O günkü oturum" : "Günlük tekillerin toplamı"}
          />
          <Kpi
            label="Bilet tıklaması"
            value={fmt(current.tickets)}
            hint={current.tickets ? `%${pct(current.tickets, current.views)} görüntülemeden` : "Henüz tıklama yok"}
          />
          <Kpi
            label="Dil"
            value={`${pct(current.locales.tr, localeTotal)}% TR`}
            hint={`${fmt(current.locales.en)} EN · ${fmt(current.locales.tr)} TR`}
          />
        </div>

        <p className="mt-5 text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">
          Saat saat{span === "day" ? "" : " · seçilen aralık toplamı"}
        </p>
        <div className="mt-2 flex h-28 items-stretch gap-px">
          {current.hours.map((count, hour) => (
            <div key={hour} className="flex min-w-0 flex-1 flex-col" title={`${hour}:00 · ${count}`}>
              <div className="flex min-h-0 flex-1 items-end">
                <div
                  className="w-full rounded-t-sm bg-green"
                  style={{ height: `${Math.max(count ? 8 : 2, Math.round((count / maxHour) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[0.58rem] font-bold text-paper/35">
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>23</span>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Sayfalar</p>
            {current.pages.length ? (
              current.pages.map((page) => <Bar key={page.id} value={page.views} max={maxPage} label={page.label} />)
            ) : (
              <p className="text-sm text-paper/45">Bu tarihte sayfa ziyareti yok.</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Nereden geldi</p>
            {current.refs.length ? (
              current.refs.map((row) => <Bar key={row.id} value={row.views} max={maxRef} label={row.label} />)
            ) : (
              <p className="text-sm text-paper/45">Bu tarihte kaynak kaydı yok.</p>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Bilet tıklaması · sayfa</p>
            {current.ticketPages.length ? (
              current.ticketPages.map((page) => (
                <Bar key={page.id} value={page.views} max={maxTicketPage} label={page.label} tone="green" />
              ))
            ) : (
              <p className="text-sm text-paper/45">Bu tarihte Biletix tıklaması yok. Sarı Bilet al’a basılınca burada sayılır.</p>
            )}
          </div>
          <div>
            <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Hareketler</p>
            <ul className="mt-2 space-y-1.5">
              {recent.length ? (
                recent.map((row, i) => (
                  <li key={`${row.t}-${row.kind}-${i}`} className="flex items-center justify-between gap-3 text-[0.78rem]">
                    <span className="min-w-0 truncate font-bold">
                      {row.kind === "ticket" ? "Bilet · " : ""}
                      {row.label}
                    </span>
                    <span className="shrink-0 text-paper/45">
                      {row.kind === "ticket" ? "Biletix" : row.ref} · {row.locale.toUpperCase()} · {when(row.t)}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-paper/45">Bu tarihte hareket yok.</li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </>
  );
}
