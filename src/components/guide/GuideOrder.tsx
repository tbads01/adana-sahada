"use client";

import { useEffect, useState } from "react";
import { flagFor } from "@/lib/flags";
import {
  groupLiveOrder,
  liveOrder,
  playerTag,
  type CourtId,
  type MatchDay,
  type OrderMatch,
  type OrderPlayer,
  type PlayStatus,
  type TimedPlay,
} from "@/lib/match-plan";
import { CourtLabel, GuideCard, LiveDot, Pill, SectionHead, useGuide } from "./GuideUi";
import { ROUTES } from "@/lib/routes";

const FOCUS_MS = 4000;
const ROW_PX = 44;

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] ?? name;
}

export function playTimeLabel(play: TimedPlay, courtStart: string, followedBy: string, notBefore: string) {
  const match = play.match;
  if (match.notBefore && match.start) return `${notBefore} ${match.start}`;
  if (play.index === 0) return match.start || courtStart;
  if (match.start) return match.start;
  return followedBy;
}

export function MatchPairing({ match }: { match: OrderMatch }) {
  return (
    <div className="mt-2 space-y-1.5">
      <OrderPlayerRow player={match.a} />
      <OrderPlayerRow player={match.b} />
    </div>
  );
}

function OrderPlayerRow({ player }: { player: OrderPlayer }) {
  const tag = playerTag(player);
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 shrink-0 text-[0.62rem] font-bold tabular-nums text-ink/40">{tag}</span>
      <p className="min-w-0 font-semibold">
        <span className="mr-1.5">{flagFor(player.country) || player.country}</span>
        {player.name}
      </p>
    </div>
  );
}

function statusPill(status: PlayStatus, live: string, next: string) {
  if (status === "live") {
    return (
      <Pill tone="live">
        <LiveDot />
        {live}
      </Pill>
    );
  }
  if (status === "next") return <Pill tone="soft">{next}</Pill>;
  return null;
}

export function NextPlayHero({ day, nowMin }: { day: MatchDay; nowMin: number | null }) {
  const { g, t } = useGuide();
  const plays = liveOrder(day, nowMin).filter((play) => play.status === "live" || play.status === "next");
  const [focus, setFocus] = useState(0);
  const [reduce, setReduce] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduce || plays.length < 2) return;
    const id = window.setInterval(() => setFocus((i) => (i + 1) % plays.length), FOCUS_MS);
    return () => window.clearInterval(id);
  }, [reduce, plays.length]);

  if (!plays.length) return null;

  const live = plays.some((play) => play.status === "live");
  const title = live ? g.onCourtNow : g.nextMatch;
  const active = plays[focus % plays.length];
  const accent = active?.status === "live" ? "bg-green" : "bg-yellow";

  return (
    <a href={ROUTES.matches} className="relative mt-4 block overflow-hidden rounded-2xl bg-panel">
      <span className={`order-progress absolute inset-x-0 top-0 h-0.5 ${accent}`} key={`${active?.courtId}-${active?.index}`} />
      <div className="px-3 pt-3 pb-2">
        <p className="text-[0.62rem] font-bold tracking-[0.14em] text-yellow uppercase">{title}</p>
        <div className="relative mt-1">
          {plays.length > 1 && !reduce ? (
            <div
              className={`order-focus pointer-events-none absolute inset-x-0 rounded-xl ${
                active?.status === "live" ? "bg-green/20" : "bg-white/10"
              }`}
              style={{ height: ROW_PX, transform: `translateY(${(focus % plays.length) * ROW_PX}px)` }}
            />
          ) : null}
          {plays.map((play, i) => {
            const on = reduce || i === focus % plays.length;
            const time = playTimeLabel(play, day.start, g.followedBy, g.notBefore);
            return (
              <div
                key={`${play.courtId}-${play.index}`}
                className="relative flex h-11 items-center gap-2.5 px-2"
              >
                <span
                  className={`h-7 w-0.5 shrink-0 rounded-full ${
                    play.status === "live" ? "bg-green" : on ? "bg-yellow" : "bg-white/20"
                  } ${play.status === "live" ? "order-pulse" : ""}`}
                />
                <p className={`shrink-0 text-[0.7rem] font-bold tabular-nums ${on ? "text-yellow" : "text-paper/40"}`}>
                  {time}
                </p>
                <p className="min-w-0 flex-1 truncate">
                  <span className={`mr-2 text-[0.62rem] font-bold tracking-wide uppercase ${on ? "text-paper/55" : "text-paper/30"}`}>
                    {t.schedule.courts[play.courtId]}
                  </span>
                  <span className={`font-display text-[0.92rem] font-bold tracking-[-0.02em] ${on ? "text-paper" : "text-paper/45"}`}>
                    {lastName(play.match.a.name)} · {lastName(play.match.b.name)}
                  </span>
                </p>
                {play.status === "live" ? <LiveDot /> : null}
              </div>
            );
          })}
        </div>
      </div>
    </a>
  );
}

export function TodayPlay({
  day,
  nowMin,
  href,
}: {
  day: MatchDay;
  nowMin: number | null;
  href?: string;
}) {
  const { g } = useGuide();
  const plays = liveOrder(day, nowMin);
  const courts = groupLiveOrder(plays);

  if (!day.courts.some((court) => court.matches?.length)) return null;

  if (!plays.length) {
    return (
      <div>
        <SectionHead title={g.todayMatches} href={href} action={href ? g.seeAll : undefined} />
        <p className="mt-2 text-sm text-ink/55">{g.playDone}</p>
      </div>
    );
  }

  return (
    <div>
      <SectionHead title={g.todayMatches} href={href} action={href ? g.seeAll : undefined} />
      <div className="mt-3 space-y-3">
        {courts.map(({ courtId, matches }) => (
          <CourtPlayCard key={courtId} courtId={courtId} matches={matches} courtStart={day.start} />
        ))}
      </div>
    </div>
  );
}

function CourtPlayCard({
  courtId,
  matches,
  courtStart,
}: {
  courtId: CourtId;
  matches: TimedPlay[];
  courtStart: string;
}) {
  const { g } = useGuide();
  return (
    <GuideCard>
      <div className="flex items-start justify-between gap-2">
        <CourtLabel id={courtId} />
      </div>
      <ol className="mt-3 divide-y divide-line-dark">
        {matches.map((play) => (
          <li
            key={`${play.courtId}-${play.index}`}
            className="py-3 first:pt-1 last:pb-0"
          >
            <div className="flex items-center justify-between gap-2">
              <p
                className={`text-[0.7rem] font-bold tracking-wide uppercase ${
                  play.status === "later" ? "text-ink/40" : "text-ink/55"
                }`}
              >
                {playTimeLabel(play, courtStart, g.followedBy, g.notBefore)}
              </p>
              {statusPill(play.status, g.onCourt, g.upNext)}
            </div>
            <div className={play.status === "later" ? "opacity-70" : ""}>
              <MatchPairing match={play.match} />
            </div>
          </li>
        ))}
      </ol>
    </GuideCard>
  );
}
