"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconInfo,
  IconLive,
  IconMegaphone,
  IconPlayers,
  IconSpark,
  IconTicket,
  IconTrophy,
} from "@/components/Icons";
import {
  MATCH_DAYS,
  activeOrNextMatchDay,
  copy,
  displayStart,
  sortedAnnouncements,
  featuredDayEvents,
  isPressConferenceEvent,
  tournamentPhase,
} from "@/lib/guide";
import { ROUTES } from "@/lib/routes";
import { TOURNAMENT_START } from "@/lib/site";
import type { CourtId, MatchRound } from "@/lib/match-plan";
import { GuideSponsors } from "./GuideSponsors";
import { GuideNotify } from "./GuideNotify";
import { CourtLines } from "./GuideArt";
import { GuideFaq } from "./GuideFaq";
import { GuideCard, CourtLabel, Pill, PressConferenceCard, SectionHead, TicketsCard, useGuide } from "./GuideUi";

function uniqueRoundNames(slots: MatchRound[], rounds: Record<MatchRound, string>) {
  const names: string[] = [];
  for (const slot of slots) {
    const name = rounds[slot];
    if (name && names[names.length - 1] !== name) names.push(name);
  }
  return names;
}

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
  const featured = featuredDayEvents(t.schedule.days, stamp);
  const sideEvents = featured?.events.filter((item) => item.tag !== "match" && !isPressConferenceEvent(item)) ?? [];
  const upcoming = activeOrNextMatchDay(stamp);
  const upcomingIndex = MATCH_DAYS.findIndex((day) => day.iso === upcoming.iso);
  const upcomingMeta = upcomingIndex >= 0 ? t.schedule.days[upcomingIndex] : undefined;
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

  const quick = [
    { href: ROUTES.tickets, label: g.tickets, icon: IconTicket },
    { href: "#sss", label: g.sss, icon: IconInfo },
    { href: ROUTES.news, label: g.news, icon: IconMegaphone },
    { href: ROUTES.players, label: g.players, icon: IconPlayers },
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
      <section className="relative overflow-visible bg-ink px-4 pt-5 pb-6 text-paper">
        <CourtLines className="pointer-events-none absolute -right-8 -top-8 h-56 w-80 text-white/12" />
        <div className="relative z-10">
        <div className="pr-[7.75rem] pt-1">
            <p className="text-[0.7rem] font-bold tracking-[0.16em] text-yellow uppercase">{g.heroEyebrow}</p>
            <h1 className="mt-3 font-display text-[2.15rem] leading-[0.92] font-extrabold tracking-[-0.05em]">
              {phase === "live" ? g.heroTitleLive : phase === "ended" ? g.heroTitleEnded : g.heroTitleUpcoming}
            </h1>
        </div>

        <GuideNotify tone="hero" />

        <div className="mt-4 rounded-2xl bg-panel p-4">
          {phase === "ended" ? (
            <p className="font-display text-xl font-bold">{g.phaseEnded}</p>
          ) : phase === "live" ? (
            <p className="font-display text-xl font-bold">{g.phaseLive}</p>
          ) : (
            <>
              <p className="text-[0.62rem] font-bold tracking-[0.14em] text-yellow uppercase">{g.phaseUpcoming}</p>
              <div className="mt-3 flex items-end gap-x-3.5">
                {[
                  [countdown ? pad(countdown.days) : "––", t.countdown.days],
                  [countdown ? pad(countdown.hours) : "––", t.countdown.hours],
                  [countdown ? pad(countdown.minutes) : "––", t.countdown.minutes],
                  [countdown ? pad(countdown.seconds) : "––", t.countdown.seconds],
                ].map(([value, unit]) => (
                  <div key={unit} className="shrink-0">
                    <p className="font-display text-[1.55rem] leading-none font-extrabold tabular-nums">{value}</p>
                    <p className="mt-1 text-[0.52rem] font-bold tracking-normal text-paper/40 uppercase">{unit}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <TicketsCard className="mt-4" />
        <PressConferenceCard className="mt-3" />

        <Image
          src="/media/brand/kaplan.webp"
          alt=""
          width={416}
          height={717}
          className="pointer-events-none absolute -right-4 top-0 z-20 block h-auto w-[7.75rem]"
          sizes="124px"
          priority
        />
        </div>
      </section>

      <div className="min-w-0 space-y-6 px-4 py-5">
        <div className="grid grid-cols-4 gap-2">
            {quick.map((item) => {
              const Icon = item.icon;
              const http = item.href.startsWith("http");
              const highlight = item.href === ROUTES.tickets || item.href === "#sss";
              const cls = highlight
                ? "flex min-w-0 flex-col items-center overflow-hidden rounded-2xl bg-yellow px-1 py-3"
                : "flex min-w-0 flex-col items-center overflow-hidden rounded-2xl bg-paper-soft px-1 py-3";
              const inner = (
                <>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                      highlight ? "bg-ink text-yellow" : "bg-yellow text-ink"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={`mt-2 w-full text-center text-[0.7rem] font-bold leading-tight ${
                      highlight ? "text-ink" : "text-ink/70"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              );
              if (http) {
                return (
                  <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className={cls}>
                    {inner}
                  </a>
                );
              }
              return (
                <Link key={item.href} href={item.href} prefetch={false} className={cls}>
                  {inner}
                </Link>
              );
            })}
        </div>

        <GuideFaq preview={4} />

        {upcoming.day.courts.length ? (
          <div>
            <SectionHead title={g.upcomingMatches} href={ROUTES.matches} action={g.seeAll} />
            <p className="mb-3 text-sm font-bold text-ink/70">
              {upcoming.isToday ? g.today : upcomingMeta?.weekday} · {upcomingMeta?.date}
            </p>
            <div className="space-y-2">
              {upcoming.day.courts.map((court) => {
                const rounds = uniqueRoundNames(court.slots, t.schedule.rounds);
                return (
                  <GuideCard key={court.id} href={ROUTES.matches}>
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow text-ink">
                        <IconTrophy className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <CourtLabel id={court.id as CourtId} size="sm" />
                        <p className="mt-0.5 text-sm font-bold text-ink/55">
                          {g.firstBall} · {displayStart(court.start, g.timeSoon)}
                        </p>
                        <p className="mt-1 text-sm leading-snug text-ink/70">{rounds.join(" · ")}</p>
                      </div>
                    </div>
                  </GuideCard>
                );
              })}
            </div>
          </div>
        ) : null}

        {featured && sideEvents.length ? (
          <div>
            <SectionHead
              title={featured.isToday ? g.todayOnSite : `${t.schedule.days[featured.index]?.weekday} · ${t.schedule.days[featured.index]?.date}`}
              href={ROUTES.events}
              action={g.seeAll}
            />
            <div className="space-y-2">
              {sideEvents.slice(0, 4).map((item) => {
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

        <GuideSponsors />

        <div>
          <SectionHead title={g.latest} href={ROUTES.news} action={g.seeAll} />
          <div className="space-y-2">
            {news.map((item) => (
              <GuideCard key={item.id} href={item.href}>
                <div className="flex items-center gap-2">
                  <Pill>{copy(locale, item.tag)}</Pill>
                  {item.pin ? <Pill tone="yellow">{g.pinned}</Pill> : null}
                </div>
                <p className="mt-2 font-display text-base font-bold tracking-[-0.02em]">{copy(locale, item.title)}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink/55">{copy(locale, item.body)}</p>
              </GuideCard>
            ))}
          </div>
        </div>

        <button type="button" onClick={() => void share()} className="btn btn-dark w-full !py-3">
          {copied ? g.shared : g.share}
        </button>
      </div>
    </div>
  );
}
