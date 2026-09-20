"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

type Props = { data: AdminDashboard };

type AdminDashboard = {
  generatedAt: number;
  today: string;
  phase: "upcoming" | "live" | "ended";
  countdown: { target: string; days: number; hours: number };
  traffic: {
    today: { views: number; unique: number; hours: number[]; locales: { tr: number; en: number } };
    yesterday: { views: number; unique: number };
    d7: { views: number; unique: number };
    total: { views: number; unique: number };
    last14: { iso: string; views: number; unique: number }[];
    pages: { path: string; label: string; views: number }[];
    locales: { tr: number; en: number };
    referrers: { id: string; label: string; views: number }[];
    todayRefs: { id: string; label: string; views: number }[];
    recent: { t: number; path: string; label: string; locale: string; ref: string }[];
    live: {
      now: number;
      peak: number;
      locales: { tr: number; en: number };
      pages: { path: string; label: string; count: number }[];
      visitors: { t: number; path: string; label: string; locale: string; ref: string }[];
    };
  };
  notify: {
    devices: number;
    new24h: number;
    lastSubscribeAt: number | null;
    sends: { t: number; title: string; sent: number; total: number }[];
  };
  matches: {
    total: number;
    played: number;
    remaining: number;
    today: { iso: string; start: string; total: number; courts: number } | null;
    byKind: { qual: number; singles: number; doubles: number };
    byCourt: { id: string; name: string; count: number }[];
    byRound: { round: string; label: string; kind: string; count: number }[];
    days: {
      iso: string;
      weekday: string;
      date: string;
      stage: string;
      start: string;
      total: number;
      status: string;
      courts: { id: string; name: string; start: string; slots: number }[];
    }[];
  };
  program: {
    days: { iso: string; weekday: string; date: string; match: number; music: number; event: number; total: number }[];
    totals: { match: number; music: number; event: number; total: number };
  };
  players: {
    total: number;
    main: number;
    alternate: number;
    turkey: number;
    photo: number;
    missingPhoto: number;
    avgAge: number | null;
    prizeTotal: number;
    careerBest: { name: string; rank: number } | null;
    rankBands: { top100: number; to150: number; to200: number; over200: number; unranked: number };
    countries: { code: string; count: number; flag: string }[];
    entries: { id: string; label: string; count: number }[];
  };
  content: {
    announcements: number;
    pinned: number;
    faqs: number;
    info: number;
    attractions: number;
    foodStands: number;
    press: { iso: string; time: string; place: string; upcoming: boolean };
  };
  live: {
    status: string;
    hasUrl: boolean;
    platform: string;
    updatedAt: string;
    scoreboard: number;
    liveCourts: number;
  };
  health: { vapidPublic: boolean; vapidPrivate: boolean; adminSecret: boolean; analyticsDays: number };
};

const NAV = [
  { id: "anlik", label: "Anlık" },
  { id: "ozet", label: "Özet" },
  { id: "trafik", label: "Trafik" },
  { id: "bildirim", label: "Bildirim" },
  { id: "maclar", label: "Maçlar" },
  { id: "program", label: "Program" },
  { id: "oyuncular", label: "Oyuncular" },
  { id: "icerik", label: "İçerik" },
  { id: "canli", label: "Canlı" },
];

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n);
}

function money(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function when(ts: number | null) {
  if (!ts) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ts);
}

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function ago(ts: number, now: number) {
  const sec = Math.max(0, Math.round((now - ts) / 1000));
  if (sec < 10) return "şimdi";
  if (sec < 60) return `${sec} sn`;
  return `${Math.floor(sec / 60)} dk`;
}

function delta(today: number, yesterday: number) {
  if (!yesterday) return today ? "Düne göre yeni" : "Dünle aynı";
  const n = Math.round(((today - yesterday) / yesterday) * 100);
  if (n === 0) return "Dünle aynı";
  return n > 0 ? `Düne göre +${n}%` : `Düne göre ${n}%`;
}

function phaseLabel(phase: AdminDashboard["phase"]) {
  if (phase === "live") return "Turnuva devam ediyor";
  if (phase === "ended") return "Turnuva bitti";
  return "Turnuva henüz başlamadı";
}

function Card({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 rounded-3xl border border-white/10 bg-panel p-4 md:p-5 ${className}`}>
      {children}
    </section>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white/5 px-3 py-3">
      <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/45 uppercase">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold tracking-[-0.04em]">{value}</p>
      {hint ? <p className="mt-0.5 text-[0.72rem] text-paper/45">{hint}</p> : null}
    </div>
  );
}

function Bar({ value, max, label, suffix }: { value: number; max: number; label: string; suffix?: string }) {
  const width = max ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <p className="w-28 shrink-0 truncate text-[0.78rem] font-bold md:w-40">{label}</p>
      <div className="h-2 min-w-0 flex-1 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-yellow" style={{ width: `${width}%` }} />
      </div>
      <p className="w-16 shrink-0 text-right text-[0.78rem] font-bold text-paper/70">
        {fmt(value)}
        {suffix ?? ""}
      </p>
    </div>
  );
}

export function AdminLogin({ devHint, error }: { devHint: boolean; error: string }) {
  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-5 py-10">
      <p className="text-[0.7rem] font-bold tracking-[0.16em] text-yellow uppercase">Adana Open</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em]">Yönetim paneli</h1>
      <p className="mt-2 text-sm leading-relaxed text-paper/55">
        Ziyaret, bildirim, maç, oyuncu ve program istatistikleri. Bildirim gönderme şifresiyle girin.
      </p>
      <form action="/api/admin/login" method="post" className="mt-6 space-y-3">
        <label className="block text-sm font-bold">
          Yönetici şifresi
          <input
            type="password"
            name="password"
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-yellow"
            required
            autoFocus
          />
        </label>
        <button type="submit" className="btn btn-primary w-full !text-ink">
          Giriş
        </button>
        {error ? <p className="text-sm font-bold text-yellow">{error}</p> : null}
        {devHint ? <p className="text-xs text-paper/40">Yerel geliştirme: .env.local içindeki PUSH_ADMIN_SECRET</p> : null}
      </form>
    </div>
  );
}

export function AdminPanel({ data: initial }: Props) {
  const [data, setData] = useState(initial);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState<string>(ROUTES.home);
  const [sendState, setSendState] = useState<"idle" | "ok" | "fail">("idle");
  const [sent, setSent] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      const json = (await res.json()) as { ok?: boolean; data?: AdminDashboard };
      if (res.ok && json.data) setData(json.data);
    } catch {
      /* keep current snapshot */
    }
  }, []);

  useEffect(() => {
    setData(initial);
  }, [initial]);

  useEffect(() => {
    const id = window.setInterval(() => void load(), 8_000);
    return () => window.clearInterval(id);
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setSendState("idle");
    const res = await fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message, url }),
    });
    const json = (await res.json()) as { ok?: boolean; sent?: number };
    if (res.ok && json.ok) {
      setSendState("ok");
      setSent(json.sent ?? 0);
      setTitle("");
      setMessage("");
      await load();
    } else {
      setSendState("fail");
    }
  }

  const maxPage = data.traffic.pages[0]?.views ?? 0;
  const maxRef = data.traffic.referrers[0]?.views ?? 0;
  const maxLivePage = data.traffic.live.pages[0]?.count ?? 0;
  const maxCountry = data.players.countries[0]?.count ?? 0;
  const maxDay = useMemo(() => Math.max(1, ...data.traffic.last14.map((d) => d.views)), [data]);
  const maxHour = useMemo(() => Math.max(1, ...data.traffic.today.hours), [data]);

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-void/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-bold tracking-[0.16em] text-yellow uppercase">Adana Open · Yönetim</p>
            <p className="truncate text-sm text-paper/55">
              {phaseLabel(data.phase)} · {when(data.generatedAt)}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => void load()} className="rounded-full bg-white/10 px-3 py-1.5 text-[0.72rem] font-bold">
              Yenile
            </button>
            <Link href={ROUTES.home} className="rounded-full bg-white/10 px-3 py-1.5 text-[0.72rem] font-bold">
              Sahaya dön
            </Link>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="rounded-full bg-yellow px-3 py-1.5 text-[0.72rem] font-bold text-ink">
                Çıkış
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[0.72rem] font-bold text-paper/70"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-6xl space-y-4 px-4 py-5">
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
            <Kpi label="Anlık kişi" value={fmt(data.traffic.live.now)} hint={data.traffic.live.peak ? `Bugünkü tepe ${fmt(data.traffic.live.peak)}` : "Henüz tepe yok"} />
            <Kpi label="Türkçe" value={fmt(data.traffic.live.locales.tr)} hint="Açık oturum" />
            <Kpi label="English" value={fmt(data.traffic.live.locales.en)} hint="Open session" />
            <Kpi label="Bugün tekil" value={fmt(data.traffic.today.unique)} hint={`${fmt(data.traffic.today.views)} görüntüleme`} />
          </div>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Şu an hangi sayfa</p>
              {data.traffic.live.pages.length ? (
                data.traffic.live.pages.map((page) => (
                  <Bar key={page.path} value={page.count} max={maxLivePage} label={page.label} />
                ))
              ) : (
                <p className="text-sm text-paper/45">Şu an açık oturum yok. Saha uygulamasını açınca burada görünür.</p>
              )}
            </div>
            <div>
              <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Açık oturumlar</p>
              <ul className="mt-2 space-y-1.5">
                {data.traffic.live.visitors.length ? (
                  data.traffic.live.visitors.map((row, i) => (
                    <li key={`${row.t}-${row.path}-${i}`} className="flex items-center justify-between gap-3 text-[0.78rem]">
                      <span className="min-w-0 truncate font-bold">{row.label}</span>
                      <span className="shrink-0 text-paper/45">
                        {row.ref} · {row.locale.toUpperCase()} · {ago(row.t, data.generatedAt)}
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

        <Card id="ozet">
          <h2 className="font-display text-xl font-extrabold">Bugün sahada</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <Kpi label="Bugün ziyaret" value={fmt(data.traffic.today.views)} hint={`${fmt(data.traffic.today.unique)} tekil · ${delta(data.traffic.today.views, data.traffic.yesterday.views)}`} />
            <Kpi label="7 gün" value={fmt(data.traffic.d7.views)} hint={`${fmt(data.traffic.d7.unique)} tekil`} />
            <Kpi label="Bildirim cihazı" value={fmt(data.notify.devices)} hint={data.notify.new24h ? `+${data.notify.new24h} son 24 saat` : "Yeni kayıt yok"} />
            <Kpi
              label={data.phase === "upcoming" ? "Açılışa" : "Bitişe"}
              value={data.phase === "ended" ? "Bitti" : `${data.countdown.days}g ${data.countdown.hours}s`}
              hint={data.matches.today ? `Bugün ${data.matches.today.total} maç · ${data.matches.today.start}` : "Bugün maç yok"}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            <Kpi label="Toplam maç" value={fmt(data.matches.total)} hint={`${fmt(data.matches.remaining)} kaldı`} />
            <Kpi label="Oyuncu" value={fmt(data.players.total)} hint={`${data.players.main} doğrudan · ${data.players.alternate} yedek`} />
            <Kpi label="Program maddesi" value={fmt(data.program.totals.total)} hint={`${data.program.totals.event} etkinlik · ${data.program.totals.music} müzik`} />
            <Kpi label="Duyuru" value={fmt(data.content.announcements)} hint={`${data.content.pinned} sabit`} />
          </div>
        </Card>

        <Card id="trafik">
          <h2 className="font-display text-xl font-extrabold">Trafik</h2>
          <p className="mt-1 text-sm text-paper/50">
            Dün {fmt(data.traffic.yesterday.views)} ziyaret · tüm zamanlar {fmt(data.traffic.total.views)} / {fmt(data.traffic.total.unique)} tekil
          </p>
          <p className="mt-4 text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Son 14 gün</p>
          <div className="mt-2 flex h-32 items-stretch gap-1">
            {data.traffic.last14.map((day) => (
              <div key={day.iso} className="flex min-w-0 flex-1 flex-col">
                <div className="flex min-h-0 flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-yellow"
                    style={{ height: `${Math.max(day.views ? 8 : 2, Math.round((day.views / maxDay) * 100))}%` }}
                    title={`${day.iso}: ${day.views}`}
                  />
                </div>
                <span className="mt-1 text-center text-[0.55rem] font-bold text-paper/40">{day.iso.slice(8)}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Bugün saat saat</p>
          <div className="mt-2 flex h-24 items-stretch gap-px">
            {data.traffic.today.hours.map((count, hour) => (
              <div key={hour} className="flex min-w-0 flex-1 flex-col">
                <div className="flex min-h-0 flex-1 items-end">
                  <div
                    className="w-full rounded-t-sm bg-green"
                    style={{ height: `${Math.max(count ? 8 : 2, Math.round((count / maxHour) * 100))}%` }}
                    title={`${hour}:00 · ${count}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Sayfalar</p>
              {data.traffic.pages.length ? (
                data.traffic.pages.map((page) => <Bar key={page.path} value={page.views} max={maxPage} label={page.label} />)
              ) : (
                <p className="text-sm text-paper/45">Henüz sayfa ziyareti yok. Panel yayına girdikten sonra dolacak.</p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Nereden geldi</p>
              {data.traffic.referrers.length ? (
                data.traffic.referrers.map((row) => <Bar key={row.id} value={row.views} max={maxRef} label={row.label} />)
              ) : (
                <p className="text-sm text-paper/45">Referrer kaydı yok. İlk ziyaretlerden sonra Google, Instagram, doğrudan giriş burada toplanır.</p>
              )}
              {data.traffic.todayRefs.length ? (
                <p className="pt-2 text-[0.72rem] text-paper/45">
                  Bugün: {data.traffic.todayRefs.map((row) => `${row.label} ${fmt(row.views)}`).join(" · ")}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Dil</p>
              <div className="mt-3 space-y-2">
                <Bar value={data.traffic.locales.tr} max={data.traffic.locales.tr + data.traffic.locales.en} label={`Türkçe ${pct(data.traffic.locales.tr, data.traffic.locales.tr + data.traffic.locales.en)}%`} />
                <Bar value={data.traffic.locales.en} max={data.traffic.locales.tr + data.traffic.locales.en} label={`English ${pct(data.traffic.locales.en, data.traffic.locales.tr + data.traffic.locales.en)}%`} />
              </div>
            </div>
            <div>
              <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Son ziyaretler</p>
              <ul className="mt-2 space-y-1.5">
                {data.traffic.recent.length ? (
                  data.traffic.recent.slice(0, 12).map((row, i) => (
                    <li key={`${row.t}-${i}`} className="flex items-center justify-between gap-3 text-[0.78rem]">
                      <span className="min-w-0 truncate font-bold">{row.label}</span>
                      <span className="shrink-0 text-paper/45">
                        {row.ref} · {row.locale.toUpperCase()} · {when(row.t)}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-paper/45">Kayıt yok.</li>
                )}
              </ul>
            </div>
          </div>
        </Card>

        <Card id="bildirim">
          <h2 className="font-display text-xl font-extrabold">Bildirimler</h2>
          <p className="mt-1 text-sm text-paper/50">
            {fmt(data.notify.devices)} kayıtlı cihaz
            {data.notify.lastSubscribeAt ? ` · son izin ${when(data.notify.lastSubscribeAt)}` : ""}
          </p>
          <form onSubmit={(e) => void send(e)} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-bold md:col-span-2">
              Başlık
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-yellow" required />
            </label>
            <label className="block text-sm font-bold md:col-span-2">
              Metin
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-yellow" required />
            </label>
            <label className="block text-sm font-bold">
              Açılacak sayfa
              <input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-yellow" />
            </label>
            <div className="flex items-end">
              <button type="submit" className="btn btn-primary w-full !text-ink">
                Herkese gönder
              </button>
            </div>
            {sendState === "ok" ? <p className="text-sm font-bold text-green md:col-span-2">Gönderildi · {sent} cihaz</p> : null}
            {sendState === "fail" ? <p className="text-sm font-bold text-yellow md:col-span-2">Gönderilemedi.</p> : null}
          </form>
          <p className="mt-5 text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Son gönderimler</p>
          <ul className="mt-2 space-y-1.5">
            {data.notify.sends.length ? (
              data.notify.sends.map((row) => (
                <li key={row.t} className="flex items-center justify-between gap-3 text-[0.78rem]">
                  <span className="truncate font-bold">{row.title}</span>
                  <span className="shrink-0 text-paper/45">
                    {row.sent}/{row.total} · {when(row.t)}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-sm text-paper/45">Henüz bildirim gönderilmedi.</li>
            )}
          </ul>
        </Card>

        <Card id="maclar">
          <h2 className="font-display text-xl font-extrabold">Maç planı</h2>
          <p className="mt-1 text-sm text-paper/50">
            {fmt(data.matches.played)} oynandı · {fmt(data.matches.remaining)} kaldı · {fmt(data.matches.byKind.qual)} eleme · {fmt(data.matches.byKind.singles)} tekler · {fmt(data.matches.byKind.doubles)} çiftler
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {data.matches.byCourt.map((court) => (
              <div key={court.id} className="rounded-2xl bg-white/5 px-3 py-3">
                <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">{court.name}</p>
                <p className="mt-1 font-display text-2xl font-extrabold">{fmt(court.count)}</p>
                <p className="text-[0.72rem] text-paper/45">slot</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {data.matches.byRound.map((row) => (
              <Bar key={row.round} value={row.count} max={data.matches.total} label={row.label} />
            ))}
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-[0.78rem]">
              <thead className="text-[0.65rem] font-bold tracking-[0.12em] text-paper/40 uppercase">
                <tr>
                  <th className="pb-2 pr-3">Gün</th>
                  <th className="pb-2 pr-3">Aşama</th>
                  <th className="pb-2 pr-3">İlk top</th>
                  <th className="pb-2 pr-3">Maç</th>
                  <th className="pb-2">Kortlar</th>
                </tr>
              </thead>
              <tbody>
                {data.matches.days.map((day) => (
                  <tr key={day.iso} className="border-t border-white/10">
                    <td className="py-2 pr-3 font-bold">
                      {day.weekday} {day.date}
                      {day.status === "bugün" ? <span className="ml-2 rounded-full bg-yellow px-1.5 py-0.5 text-[0.58rem] text-ink">BUGÜN</span> : null}
                    </td>
                    <td className="py-2 pr-3 text-paper/60">{day.stage}</td>
                    <td className="py-2 pr-3">{day.total ? day.start : "—"}</td>
                    <td className="py-2 pr-3">{day.total}</td>
                    <td className="py-2 text-paper/60">{day.courts.map((c) => `${c.name} ${c.slots}`).join(" · ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card id="program">
          <h2 className="font-display text-xl font-extrabold">Günlük program</h2>
          <p className="mt-1 text-sm text-paper/50">Maç + yan etkinlik + müzik maddeleri</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-[0.78rem]">
              <thead className="text-[0.65rem] font-bold tracking-[0.12em] text-paper/40 uppercase">
                <tr>
                  <th className="pb-2 pr-3">Gün</th>
                  <th className="pb-2 pr-3">Maç</th>
                  <th className="pb-2 pr-3">Etkinlik</th>
                  <th className="pb-2 pr-3">Müzik</th>
                  <th className="pb-2">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {data.program.days.map((day) => (
                  <tr key={day.iso || day.date} className="border-t border-white/10">
                    <td className="py-2 pr-3 font-bold">
                      {day.weekday} {day.date}
                    </td>
                    <td className="py-2 pr-3">{day.match}</td>
                    <td className="py-2 pr-3">{day.event}</td>
                    <td className="py-2 pr-3">{day.music}</td>
                    <td className="py-2">{day.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card id="oyuncular">
          <h2 className="font-display text-xl font-extrabold">Oyuncular</h2>
          <p className="mt-1 text-sm text-paper/50">
            {data.players.turkey} Türk · fotoğraf {data.players.photo}/{data.players.total}
            {data.players.avgAge ? ` · yaş ort. ${data.players.avgAge}` : ""}
            {data.players.careerBest ? ` · en iyi kariyer ${data.players.careerBest.name} #${data.players.careerBest.rank}` : ""}
          </p>
          <p className="mt-2 text-sm text-paper/50">Toplam ödül havuzu (listedekiler): {money(data.players.prizeTotal)}</p>
          <div className="mt-4 grid gap-2 md:grid-cols-5">
            <Kpi label="Top 100" value={fmt(data.players.rankBands.top100)} />
            <Kpi label="101–150" value={fmt(data.players.rankBands.to150)} />
            <Kpi label="151–200" value={fmt(data.players.rankBands.to200)} />
            <Kpi label="200+" value={fmt(data.players.rankBands.over200)} />
            <Kpi label="Sırasız" value={fmt(data.players.rankBands.unranked)} />
          </div>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Ülke</p>
              {data.players.countries.map((row) => (
                <Bar key={row.code} value={row.count} max={maxCountry} label={`${row.flag} ${row.code}`} />
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">Kabul</p>
              {data.players.entries.map((row) => (
                <Bar key={row.id} value={row.count} max={data.players.total} label={row.label} />
              ))}
              {data.players.missingPhoto ? (
                <p className="pt-3 text-sm text-yellow">{data.players.missingPhoto} oyuncunun fotoğrafı yok.</p>
              ) : (
                <p className="pt-3 text-sm text-green">Tüm oyuncuların fotoğrafı var.</p>
              )}
            </div>
          </div>
        </Card>

        <Card id="icerik">
          <h2 className="font-display text-xl font-extrabold">İçerik ve saha</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
            <Kpi label="Duyuru" value={fmt(data.content.announcements)} hint={`${data.content.pinned} sabit`} />
            <Kpi label="SSS" value={fmt(data.content.faqs)} />
            <Kpi label="Saha bilgisi" value={fmt(data.content.info)} />
            <Kpi label="Her gün" value={fmt(data.content.attractions)} />
            <Kpi label="Food court" value={fmt(data.content.foodStands)} hint="stand" />
            <Kpi
              label="Basın toplantısı"
              value={data.content.press.upcoming ? "Yakında" : "Geçti"}
              hint={`${data.content.press.iso} ${data.content.press.time} · ${data.content.press.place}`}
            />
          </div>
        </Card>

        <Card id="canli">
          <h2 className="font-display text-xl font-extrabold">Canlı ve sistem</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <Kpi label="Yayın" value={data.live.status === "live" ? "Açık" : data.live.status === "ended" ? "Bitti" : "Bekliyor"} hint={data.live.hasUrl ? data.live.platform : "Link yok"} />
            <Kpi label="Skor panosu" value={fmt(data.live.scoreboard)} hint={`${data.live.liveCourts} canlı kort`} />
            <Kpi label="VAPID" value={data.health.vapidPrivate ? "Hazır" : "Eksik"} hint={data.health.vapidPublic ? "public var" : "public yok"} />
            <Kpi label="Admin şifresi" value={data.health.adminSecret ? "Tanımlı" : "Yerel"} hint={`${data.health.analyticsDays} gün trafik kaydı`} />
          </div>
          <p className="mt-3 text-[0.72rem] text-paper/40">Canlı skor güncellemesi: {data.live.updatedAt || "—"}</p>
        </Card>
      </div>
    </div>
  );
}
