"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconCalendar,
  IconLive,
  IconMegaphone,
  IconPin,
  IconPlay,
  IconPlayers,
  IconSpark,
  IconTicket,
  IconTrophy,
} from "@/components/Icons";
import {
  ATTRACTIONS,
  MATCH_DAYS,
  copy,
  getLiveData,
  pickNextMatch,
  sortedAnnouncements,
  featuredDayEvents,
  tournamentPhase,
} from "@/lib/guide";
import { ROUTES } from "@/lib/routes";
import { INSTAGRAM, MAIN_SITE_URL, TOURNAMENT_START } from "@/lib/site";
import { GuideSponsors } from "./GuideSponsors";
import { GuideNotify } from "./GuideNotify";
import { AttractionArt, CourtLines, TennisBall } from "./GuideArt";
import { GuideCard, LiveDot, Pill, SectionHead, useGuide } from "./GuideUi";

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

export function GuideHome() {
  const { g, t, locale } = useGuide();
  const [now, setNow] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const phase = tournamentPhase(now ?? Date.now());
  const stamp = now ?? Date.now();
  const nextMatch = pickNextMatch(t.schedule.days, stamp);
  const featured = featuredDayEvents(t.schedule.days, stamp);
  const sideEvents = featured?.events.filter((item) => item.tag !== "match") ?? [];
  const live = getLiveData();
  const news = sortedAnnouncements().slice(0, 3);
  const start = Date.parse(TOURNAMENT_START);
  const remain = now == null ? null : Math.max(0, start - now);
  const countdown = remain == null
    ? null
    : {
        days: Math.floor(remain / 86_400_000),
        hours: Math.floor((remain % 86_400_000) / 3_600_000),
        minutes: Math.floor((remain % 3_600_000) / 60_000),
        seconds: Math.floor((remain % 60_000) / 1000),
      };

  const dayIndex = nextMatch?.dayIndex ?? -1;
  const label = dayIndex >= 0 ? t.schedule.days[dayIndex] : undefined;
  const nextCourt = dayIndex >= 0 ? MATCH_DAYS[dayIndex]?.courts[0]?.id : undefined;

  const quick = [
    { href: ROUTES.matches, label: g.matches, icon: IconCalendar },
    { href: ROUTES.events, label: g.events, icon: IconSpark },
    { href: ROUTES.live, label: g.live, icon: IconPlay },
    { href: ROUTES.news, label: g.news, icon: IconMegaphone },
    { href: ROUTES.players, label: g.players, icon: IconPlayers },
    { href: ROUTES.info, label: g.maps, icon: IconPin },
    { href: ROUTES.tickets, label: g.tickets, icon: IconTicket },
    { href: INSTAGRAM, label: g.instagram, icon: IconLive },
  ];

  async function share() {
    const payload = { title: "Adana Open", text: g.tagline, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
    } catch {
      /* fall through */
    }
    await navigator.clipboard.writeText(payload.url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div>
      <section className="relative overflow-x-hidden bg-ink px-4 pt-5 pb-6 text-paper">
        <CourtLines className="pointer-events-none absolute -right-12 -top-10 h-56 w-80 text-white/12" />
        <div className="relative z-10">
        <div className="flex items-center gap-2">
          <TennisBall className="h-7 w-7 shrink-0" />
          <p className="text-[0.62rem] font-bold tracking-[0.16em] text-yellow uppercase">{g.heroEyebrow}</p>
        </div>
        <h1 className="mt-3 font-display text-[2.15rem] leading-[0.92] font-extrabold tracking-[-0.05em]">
          {phase === "live" ? g.heroTitleLive : phase === "ended" ? g.heroTitleEnded : g.heroTitleUpcoming}
        </h1>

        <GuideNotify tone="hero" />

        <div className="mt-4 rounded-2xl bg-panel p-4">
          {phase === "ended" ? (
            <p className="font-display text-xl font-bold">{g.phaseEnded}</p>
          ) : phase === "live" ? (
            <p className="font-display text-xl font-bold">{g.phaseLive}</p>
          ) : (
            <>
              <p className="text-[0.62rem] font-bold tracking-[0.14em] text-yellow uppercase">{g.phaseUpcoming}</p>
              <div className="mt-3 grid min-w-0 grid-cols-4 gap-1">
                {[
                  [countdown ? pad(countdown.days) : "––", t.countdown.days],
                  [countdown ? pad(countdown.hours) : "––", t.countdown.hours],
                  [countdown ? pad(countdown.minutes) : "––", t.countdown.minutes],
                  [countdown ? pad(countdown.seconds) : "––", t.countdown.seconds],
                ].map(([value, unit]) => (
                  <div key={unit} className="min-w-0 overflow-hidden">
                    <p className="font-display text-[1.55rem] font-extrabold tabular-nums">{value}</p>
                    <p className="truncate text-[0.52rem] font-bold tracking-normal text-paper/40 uppercase">{unit}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {nextMatch ? (
          <Link
            href={ROUTES.matches}
            prefetch={false}
            className="mt-4 flex items-start gap-3 overflow-hidden rounded-2xl bg-paper p-4 text-ink"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow text-ink">
              {nextMatch.isLive ? <IconPlay className="h-5 w-5" /> : <IconCalendar className="h-5 w-5" />}
            </span>
            <span className="min-w-0">
            <Pill tone={nextMatch.isLive ? "live" : nextMatch.isToday ? "yellow" : "muted"}>
              {nextMatch.isLive ? (
                <>
                  <LiveDot />
                  {g.onCourtNow}
                </>
              ) : (
                g.nextMatch
              )}
            </Pill>
            <p className="mt-2 font-display text-xl font-bold tracking-[-0.03em] text-ink">{nextMatch.event.title}</p>
            <p className="mt-1 text-sm text-ink/55">
              {label?.weekday} · {label?.date}
            </p>
            <p className="mt-3 text-sm font-bold text-ink/70">
              {nextMatch.event.time}
              {nextCourt ? ` · ${t.schedule.courts[nextCourt]}` : ""}
            </p>
            </span>
          </Link>
        ) : null}

        </div>
      </section>

      <div className="min-w-0 space-y-6 px-4 py-5">
        {featured && sideEvents.length ? (
          <div>
            <SectionHead
              title={featured.isToday ? g.todayOnSite : `${t.schedule.days[featured.index]?.weekday} · ${t.schedule.days[featured.index]?.date}`}
              href={ROUTES.events}
              action={g.seeAll}
            />
            <div className="space-y-2">
              {sideEvents.slice(0, 5).map((item) => {
                const Icon = item.tag === "music" ? IconLive : item.tag === "match" ? IconTrophy : IconSpark;
                return (
                <GuideCard key={`${item.time}-${item.title}`} href={ROUTES.events}>
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow text-ink">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                      <p className="min-w-0 font-display text-base font-bold">{item.title}</p>
                      <p className="shrink-0 text-sm font-bold tabular-nums text-ink/50">{item.time}</p>
                    </div>
                  </div>
                </GuideCard>
                );
              })}
            </div>
          </div>
        ) : null}

        <div>
          <SectionHead title={g.alwaysOn} href={ROUTES.events} action={g.seeAll} />
          <div className="grid grid-cols-2 gap-2">
            {ATTRACTIONS.map((item) => (
              <GuideCard key={item.id} href={ROUTES.events}>
                <span className="relative mb-2 block h-20 overflow-hidden rounded-xl">
                  <AttractionArt id={item.icon} />
                </span>
                <p className="font-display text-sm font-bold">{copy(locale, item.title)}</p>
                <p className="mt-1 line-clamp-2 text-[0.7rem] leading-relaxed text-ink/50">{copy(locale, item.body)}</p>
              </GuideCard>
            ))}
          </div>
        </div>

        <GuideCard href={live.stream.url || ROUTES.live} className="!bg-ink !text-paper">
          <span className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow text-ink">
              <IconPlay className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                {live.stream.status === "live" ? <LiveDot /> : null}
                <span className="font-display text-lg font-bold">
                  {live.stream.status === "live" ? g.streamLive : g.streamSoon}
                </span>
              </span>
              <span className="mt-0.5 block text-sm leading-relaxed text-paper/55">{g.streamHint}</span>
            </span>
          </span>
        </GuideCard>

        <div>
          <SectionHead title={g.quick} />
          <div className="grid grid-cols-4 gap-2">
            {quick.map((item) => {
              const Icon = item.icon;
              const external = item.href.startsWith("http");
              const inner = (
                <>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-yellow text-ink">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="mt-2 w-full truncate text-center text-[0.62rem] font-bold leading-tight text-ink/70">{item.label}</span>
                </>
              );
              const cls = "flex min-w-0 flex-col items-center overflow-hidden rounded-2xl bg-paper-soft px-1 py-3";
              return external ? (
                <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className={cls}>
                  {inner}
                </a>
              ) : (
                <Link key={item.href} href={item.href} prefetch={false} className={cls}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>

        <GuideSponsors />

        <div>
          <SectionHead title={g.latest} href={ROUTES.news} action={g.seeAll} />
          <div className="space-y-2">
            {news.map((item) => (
              <GuideCard key={item.id} href={item.href}>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow text-ink">
                    <IconMegaphone className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Pill>{copy(locale, item.tag)}</Pill>
                  {item.pin ? <Pill tone="yellow">{g.pinned}</Pill> : null}
                </div>
                <p className="mt-2 font-display text-base font-bold tracking-[-0.02em]">{copy(locale, item.title)}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink/55">{copy(locale, item.body)}</p>
                  </div>
                </div>
              </GuideCard>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={() => void share()} className="btn btn-dark flex-1 !py-3">
            {copied ? g.shared : g.share}
          </button>
          <Link href={MAIN_SITE_URL} prefetch={false} className="btn btn-ghost flex-1 !py-3">
            {g.site}
          </Link>
        </div>
      </div>
    </div>
  );
}
