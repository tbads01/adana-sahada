"use client";

import { useEffect, useState } from "react";
import { flagFor } from "@/lib/flags";
import {
  groupLiveOrder,
  liveOrder,
  playerTag,
  roundKind,
  type CourtId,
  type MatchDay,
  type OrderMatch,
  type OrderPlayer,
  type PlayStatus,
  type TimedPlay,
} from "@/lib/match-plan";
import { CourtLabel, GuideCard, LiveDot, Pill, SectionHead, useGuide } from "./GuideUi";
import { ROUTES } from "@/lib/routes";
import { findScore, type WtaCourtDay, type WtaDay, type WtaDrawPair, type WtaScore, type WtaSide } from "@/lib/wta-scores";

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

export function MatchPairing({ match, score }: { match: OrderMatch; score?: WtaScore | null }) {
  return (
    <div className="mt-2 space-y-1.5">
      <OrderPlayerRow player={match.a} won={score?.winner ? score.winner === "a" : undefined} serving={score?.serving === "a"} />
      <OrderPlayerRow player={match.b} won={score?.winner ? score.winner === "b" : undefined} serving={score?.serving === "b"} />
      <ScoreBits score={score} />
    </div>
  );
}

function OrderPlayerRow({
  player,
  won,
  serving,
}: {
  player: OrderPlayer;
  won?: boolean;
  serving?: boolean;
}) {
  const { g } = useGuide();
  const tag = playerTag(player);
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 shrink-0 text-[0.62rem] font-bold tabular-nums text-ink/40">{tag}</span>
      <p className={`min-w-0 flex-1 font-semibold ${won === false ? "opacity-55" : ""}`}>
        <span className="mr-1.5">{flagFor(player.country) || player.country}</span>
        {player.name}
      </p>
      {serving ? <span className="text-[0.58rem] font-bold tracking-wide text-green-deep uppercase">{g.serving}</span> : null}
    </div>
  );
}

function ScoreBits({ score }: { score?: WtaScore | null }) {
  const { g } = useGuide();
  if (!score) return null;
  if (score.state === "cancelled") {
    return <p className="text-[0.7rem] font-bold tracking-wide text-ink/40 uppercase">{g.cancelled}</p>;
  }
  if (!score.scoreLine && !score.points) return null;
  return (
    <p className="font-display text-base font-extrabold tabular-nums">
      {score.scoreLine}
      {score.points ? `  ${score.points[0]}–${score.points[1]}` : ""}
      {score.retired ? <span className="ml-2 text-[0.7rem] font-bold text-ink/45 uppercase">{g.retired}</span> : null}
    </p>
  );
}

function statusPill(status: PlayStatus, live: string, next: string, done: string, cancelled: string, score?: WtaScore | null) {
  if (score?.state === "live") {
    return (
      <Pill tone="live">
        <LiveDot />
        {live}
      </Pill>
    );
  }
  if (score?.state === "complete") return <Pill tone="muted">{done}</Pill>;
  if (score?.state === "cancelled") return <Pill tone="muted">{cancelled}</Pill>;
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

export function NextPlayHero({
  day,
  nowMin,
  kicker,
}: {
  day: MatchDay;
  nowMin: number | null;
  kicker?: string;
}) {
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
  const title = kicker || (live ? g.onCourtNow : g.nextMatch);
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
  title,
  scores,
}: {
  day: MatchDay;
  nowMin: number | null;
  href?: string;
  title?: string;
  scores?: WtaScore[];
}) {
  const { g } = useGuide();
  const plays = liveOrder(day, nowMin);
  const courts = groupLiveOrder(plays);
  const heading = title || g.todayMatches;

  if (!day.courts.some((court) => court.matches?.length)) return null;

  if (!plays.length) {
    return (
      <div>
        <SectionHead title={heading} href={href} action={href ? g.seeAll : undefined} />
        <p className="mt-2 text-sm text-ink/55">{g.playDone}</p>
      </div>
    );
  }

  return (
    <div>
      <SectionHead title={heading} href={href} action={href ? g.seeAll : undefined} />
      <div className="mt-3 space-y-3">
        {courts.map(({ courtId, matches }) => (
          <CourtPlayCard key={courtId} courtId={courtId} matches={matches} courtStart={day.start} scores={scores} />
        ))}
      </div>
    </div>
  );
}

function CourtPlayCard({
  courtId,
  matches,
  courtStart,
  scores,
}: {
  courtId: CourtId;
  matches: TimedPlay[];
  courtStart: string;
  scores?: WtaScore[];
}) {
  const { g } = useGuide();
  return (
    <GuideCard>
      <div className="flex items-start justify-between gap-2">
        <CourtLabel id={courtId} />
      </div>
      <ol className="mt-3 divide-y divide-line-dark">
        {matches.map((play) => {
          const score = scores?.length ? findScore(scores, play.match.a.name, play.match.b.name) : null;
          const later =
            play.status === "later" &&
            score?.state !== "live" &&
            score?.state !== "complete" &&
            score?.state !== "cancelled";
          return (
            <li key={`${play.courtId}-${play.index}`} className="py-3 first:pt-1 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-[0.7rem] font-bold tracking-wide uppercase ${later ? "text-ink/40" : "text-ink/55"}`}>
                  {playTimeLabel(play, courtStart, g.followedBy, g.notBefore)}
                </p>
                {statusPill(play.status, g.onCourt, g.upNext, g.complete, g.cancelled, score)}
              </div>
              <div className={later ? "opacity-70" : ""}>
                <MatchPairing match={play.match} score={score} />
              </div>
            </li>
          );
        })}
      </ol>
    </GuideCard>
  );
}

export function WtaLiveHero({ matches }: { matches: WtaScore[] }) {
  const { g, t } = useGuide();
  if (!matches.length) return null;
  return (
    <a href={ROUTES.live} className="relative mt-4 block overflow-hidden rounded-2xl bg-panel">
      <span className="order-pulse absolute inset-x-0 top-0 h-0.5 bg-green" />
      <div className="px-3 pt-3 pb-2">
        <p className="text-[0.62rem] font-bold tracking-[0.14em] text-yellow uppercase">{g.onCourtNow}</p>
        {matches.map((row) => (
          <div key={row.id} className="flex items-center gap-2.5 px-2 py-2">
            <LiveDot />
            <p className="min-w-0 flex-1 truncate font-display text-[0.92rem] font-bold tracking-[-0.02em] text-paper">
              {row.courtId ? `${t.schedule.courts[row.courtId]} · ` : ""}
              {row.a.short || row.a.last} · {row.b.short || row.b.last}
            </p>
            <p className="shrink-0 font-display text-sm font-extrabold tabular-nums text-yellow">
              {row.scoreLine || "0–0"}
              {row.points ? `  ${row.points[0]}–${row.points[1]}` : ""}
            </p>
          </div>
        ))}
      </div>
    </a>
  );
}

function sideTag(side: WtaSide) {
  if (side.seed) return `[${side.seed}]`;
  if (side.entry === "WC" || side.wc) return "WC";
  if (side.entry === "Q" || side.entry === "LL" || side.entry === "SE") return side.entry;
  return "";
}

function parseSetCell(value: string) {
  const match = value.match(/^(\d+)\((\d+)\)$/);
  if (match) return { games: match[1], tb: match[2] };
  return { games: value, tb: "" };
}

function setCells(sets: [string, string][]) {
  return sets.map(([a, b]) => {
    const left = parseSetCell(a);
    const right = parseSetCell(b);
    const na = Number(left.games);
    const nb = Number(right.games);
    return {
      a: left,
      b: right,
      aWon: !Number.isNaN(na) && !Number.isNaN(nb) && na > nb,
      bWon: !Number.isNaN(na) && !Number.isNaN(nb) && nb > na,
    };
  });
}

function SetCell({ games, tb, won }: { games: string; tb: string; won: boolean }) {
  return (
    <span className={`inline-flex w-6 justify-center font-display text-[0.95rem] font-extrabold tabular-nums ${won ? "text-ink" : "text-ink/30"}`}>
      {games}
      {tb ? <sup className="ml-px text-[0.5rem] font-bold text-ink/45">{tb}</sup> : null}
    </span>
  );
}

function ScoreRow({
  side,
  cells,
  points,
  dim,
  serving,
}: {
  side: WtaSide;
  cells: { games: string; tb: string; won: boolean }[];
  points?: string;
  dim?: boolean;
  serving?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex w-2.5 shrink-0 justify-center">
        {serving ? <span className="block h-1.5 w-1.5 rounded-full bg-green" /> : null}
      </span>
      <span className="w-7 shrink-0 text-[0.62rem] font-bold tabular-nums text-ink/40">{sideTag(side)}</span>
      <p className={`min-w-0 flex-1 truncate text-sm font-semibold ${dim ? "opacity-45" : ""}`}>
        <span className="mr-1.5">{flagFor(side.country) || side.country}</span>
        {side.short || side.last || side.name}
      </p>
      {cells.length ? (
        <p className="flex shrink-0 items-baseline">
          {cells.map((cell, i) => (
            <SetCell key={i} games={cell.games} tb={cell.tb} won={cell.won} />
          ))}
          {points ? (
            <span className="ml-1 w-7 text-center font-display text-sm font-extrabold tabular-nums text-green-deep">{points}</span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

function matchTime(row: WtaScore, index: number, courtStart: string, followedBy: string, notBefore: string) {
  if (row.notBefore && row.start) return `${notBefore} ${row.start}`;
  if (row.start) return row.start;
  if (index === 0) return courtStart;
  return followedBy;
}

export function WtaMatchRow({
  row,
  time,
  next,
}: {
  row: WtaScore;
  time?: string;
  next?: boolean;
}) {
  const { g } = useGuide();
  const live = row.state === "live";
  const cancelled = row.state === "cancelled";
  const sets = setCells(row.sets);
  const aCells = sets.map((set) => ({ ...set.a, won: set.aWon }));
  const bCells = sets.map((set) => ({ ...set.b, won: set.bWon }));
  return (
    <li className="py-2.5 first:pt-0 last:pb-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[0.7rem] font-bold tracking-wide text-ink/40 uppercase">
          {time}
          {roundKind(row.round) === "doubles" ? ` · ${g.legendDoubles}` : ""}
        </p>
        {live ? (
          <Pill tone="live">
            <LiveDot />
            {g.onCourt}
          </Pill>
        ) : cancelled ? (
          <Pill tone="muted">{g.cancelled}</Pill>
        ) : row.retired ? (
          <Pill tone="muted">{g.retired}</Pill>
        ) : next ? (
          <Pill tone="soft">{g.upNext}</Pill>
        ) : null}
      </div>
      <div className="space-y-1">
        <ScoreRow side={row.a} cells={aCells} points={live ? row.points?.[0] : undefined} dim={row.winner === "b"} serving={row.serving === "a"} />
        <ScoreRow side={row.b} cells={bCells} points={live ? row.points?.[1] : undefined} dim={row.winner === "a"} serving={row.serving === "b"} />
      </div>
    </li>
  );
}

export function WtaCourtList({ day }: { day: WtaDay }) {
  const nextIds = new Set(
    day.courts
      .map((court) => court.matches.find((row) => row.state === "scheduled")?.id)
      .filter((id): id is string => Boolean(id)),
  );
  return (
    <div className="space-y-3">
      {day.courts.map((court) => (
        <WtaCourtCard key={court.courtId} court={court} nextId={nextIds} />
      ))}
    </div>
  );
}

export function WtaDrawList({ pairs }: { pairs: WtaDrawPair[] }) {
  if (!pairs.length) return null;
  return (
    <GuideCard>
      <ol className="divide-y divide-line-dark">
        {pairs.map((pair, index) => (
          <li key={`${pair.a.last}-${pair.b.last}-${index}`} className="py-2.5 first:pt-0 last:pb-0">
            <div className="space-y-1">
              <ScoreRow side={pair.a} cells={[]} />
              <ScoreRow side={pair.b} cells={[]} />
            </div>
          </li>
        ))}
      </ol>
    </GuideCard>
  );
}

function WtaCourtCard({ court, nextId }: { court: WtaCourtDay; nextId: Set<string> }) {
  const { g } = useGuide();
  return (
    <GuideCard>
      <CourtLabel id={court.courtId} />
      <ol className="mt-3 divide-y divide-line-dark">
        {court.matches.map((row, index) => (
          <WtaMatchRow
            key={row.id}
            row={row}
            time={matchTime(row, index, court.start, g.followedBy, g.notBefore)}
            next={nextId.has(row.id)}
          />
        ))}
      </ol>
    </GuideCard>
  );
}

export function WtaNextHero({ matches, kicker }: { matches: WtaScore[]; kicker?: string }) {
  const { g, t } = useGuide();
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
    if (reduce || matches.length < 2) return;
    const id = window.setInterval(() => setFocus((i) => (i + 1) % matches.length), FOCUS_MS);
    return () => window.clearInterval(id);
  }, [reduce, matches.length]);

  if (!matches.length) return null;

  const live = matches.some((row) => row.state === "live");
  const active = matches[focus % matches.length];
  const accent = live ? "bg-green" : "bg-yellow";

  return (
    <a href={ROUTES.matches} className="relative mt-4 block overflow-hidden rounded-2xl bg-panel">
      <span className={`order-progress absolute inset-x-0 top-0 h-0.5 ${accent}`} key={active?.id} />
      <div className="px-3 pt-3 pb-2">
        <p className="text-[0.62rem] font-bold tracking-[0.14em] text-yellow uppercase">
          {kicker || (live ? g.onCourtNow : g.nextMatch)}
        </p>
        <div className="relative mt-1">
          {matches.length > 1 && !reduce ? (
            <div
              className={`order-focus pointer-events-none absolute inset-x-0 rounded-xl ${
                active?.state === "live" ? "bg-green/20" : "bg-white/10"
              }`}
              style={{ height: ROW_PX, transform: `translateY(${(focus % matches.length) * ROW_PX}px)` }}
            />
          ) : null}
          {matches.map((row, i) => {
            const on = reduce || i === focus % matches.length;
            return (
              <div key={row.id} className="relative flex h-11 items-center gap-2.5 px-2">
                <span
                  className={`h-7 w-0.5 shrink-0 rounded-full ${
                    row.state === "live" ? "bg-green" : on ? "bg-yellow" : "bg-white/20"
                  } ${row.state === "live" ? "order-pulse" : ""}`}
                />
                <p className={`shrink-0 text-[0.7rem] font-bold tabular-nums ${on ? "text-yellow" : "text-paper/40"}`}>
                  {row.start || g.followedBy}
                </p>
                <p className="min-w-0 flex-1 truncate">
                  <span className={`mr-2 text-[0.62rem] font-bold tracking-wide uppercase ${on ? "text-paper/55" : "text-paper/30"}`}>
                    {row.courtId ? t.schedule.courts[row.courtId] : ""}
                  </span>
                  <span className={`font-display text-[0.92rem] font-bold tracking-[-0.02em] ${on ? "text-paper" : "text-paper/45"}`}>
                    {row.a.short || row.a.last} · {row.b.short || row.b.last}
                  </span>
                </p>
                {row.state === "live" ? (
                  <p className="shrink-0 font-display text-sm font-extrabold tabular-nums text-yellow">
                    {row.scoreLine || "0–0"}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </a>
  );
}
