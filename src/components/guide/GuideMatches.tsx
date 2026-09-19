"use client";

import { useMemo, useState } from "react";
import { FLAGS } from "@/lib/flags";
import {
  MATCH_DAYS,
  activeOrNextMatchDay,
  getLiveData,
  type ScoreboardMatch,
} from "@/lib/guide";
import { roundKind, type CourtId, type MatchRound } from "@/lib/match-plan";
import { WTA_URL } from "@/lib/site";
import { DayTabs, GuideCard, LiveDot, Pill, SectionHead, useGuide } from "./GuideUi";

const STATUS_TONE = {
  live: "live",
  next: "yellow",
  complete: "muted",
  warmup: "ink",
} as const;

function scoreLine(match: ScoreboardMatch) {
  if (!match.sets.length) return "0–0";
  return match.sets.map((set) => set.join("–")).join("  ");
}

export function GuideMatches() {
  const { g, t, locale } = useGuide();
  const playable = useMemo(() => MATCH_DAYS.filter((d) => d.courts.length), []);
  const initial = activeOrNextMatchDay().iso;
  const [selected, setSelected] = useState(initial);
  const live = getLiveData();
  const day = playable.find((d) => d.iso === selected) ?? playable[0];
  const dayIndex = MATCH_DAYS.findIndex((d) => d.iso === selected);
  const meta = t.schedule.days[dayIndex];

  const board = useMemo(
    () => live.scoreboard.filter((row) => day.courts.some((court) => court.id === row.courtId)),
    [live.scoreboard, day],
  );

  return (
    <div className="px-4 py-5">
      <h1 className="font-display text-2xl font-extrabold tracking-[-0.04em]">{g.matches}</h1>
      <p className="mt-1 text-sm text-ink/55">{g.draftNote}</p>

      <div className="mt-4">
        <DayTabs selected={selected} onSelect={setSelected} days={playable} />
      </div>

      <GuideCard className="mt-4 !bg-surface">
        <p className="text-[0.62rem] font-bold tracking-[0.14em] text-ink/40 uppercase">{meta?.stage}</p>
        <p className="mt-1 font-display text-xl font-bold">{meta?.date}</p>
        <p className="mt-2 text-sm text-ink/55">
          {g.firstBall} {day.start} · {day.total} {g.matchesCount}
        </p>
        <p className="mt-1 text-sm font-bold text-ink/70">
          {day.courts.map((court) => t.schedule.courts[court.id as CourtId]).join(" · ")}
        </p>
      </GuideCard>

      {board.length ? (
        <div className="mt-6">
          <SectionHead title={g.scoreboard} />
          <div className="space-y-2">
            {board.map((row) => (
              <ScoreCard key={`${row.courtId}-${row.a.name}`} match={row} />
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink/50">{g.scoreboardEmpty}</p>
      )}

      <div className="mt-6">
        <SectionHead title={`${t.schedule.matchTitle} ${t.schedule.matchAccent}`} />
        <div className="space-y-3">
          {day.courts.map((court) => (
            <GuideCard key={court.id}>
              <p className="font-display text-lg font-bold">{t.schedule.courts[court.id as CourtId]}</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-ink/50">
                {g.firstBall} {court.start}
              </p>
              <ol className="mt-3 space-y-2">
                {court.slots.map((round, i) => (
                  <li key={`${court.id}-${round}-${i}`} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <RoundChip round={round} />
                      <span className="font-semibold">{t.schedule.rounds[round]}</span>
                    </span>
                    <span className="text-ink/40">{i === 0 ? court.start : g.followedBy}</span>
                  </li>
                ))}
              </ol>
            </GuideCard>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[0.62rem] font-bold uppercase">
        <span className="rounded-full bg-green/15 px-2 py-1 text-green-deep">{g.legendQual}</span>
        <span className="rounded-full bg-ink px-2 py-1 text-paper">{g.legendSingles}</span>
        <span className="rounded-full bg-yellow px-2 py-1 text-ink">{g.legendDoubles}</span>
      </div>

      <a
        href={WTA_URL}
        target="_blank"
        rel="noreferrer"
        className="btn btn-dark mt-6 w-full"
      >
        {g.officialScores} ↗
      </a>
      <p className="mt-3 text-center text-[0.7rem] text-ink/40">
        {g.updated}
        {locale === "tr" ? " · taslak plan" : " · draft plan"}
      </p>
    </div>
  );
}

function RoundChip({ round }: { round: MatchRound }) {
  const kind = roundKind(round);
  const cls =
    kind === "qual" ? "bg-green/15 text-green-deep" : kind === "doubles" ? "bg-yellow text-ink" : "bg-ink text-paper";
  return <span className={`rounded-full px-2 py-0.5 text-[0.58rem] font-bold ${cls}`}>{round}</span>;
}

function ScoreCard({ match }: { match: ScoreboardMatch }) {
  const { g, t } = useGuide();
  const tone = STATUS_TONE[match.status];
  const label =
    match.status === "live" ? g.onCourt : match.status === "next" ? g.upNext : match.status === "warmup" ? g.warmup : g.complete;

  return (
    <GuideCard>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold">{t.schedule.courts[match.courtId]}</p>
        <Pill tone={tone}>
          {match.status === "live" ? <LiveDot /> : null}
          {label}
        </Pill>
      </div>
      <p className="mt-1 text-[0.7rem] font-bold tracking-wide text-ink/40 uppercase">{t.schedule.rounds[match.round]}</p>
      <div className="mt-3 space-y-1.5">
        <PlayerRow name={match.a.name} country={match.a.country} serving={match.serving === "a"} />
        <PlayerRow name={match.b.name} country={match.b.country} serving={match.serving === "b"} />
      </div>
      <p className="mt-3 font-display text-xl font-extrabold tabular-nums">{scoreLine(match)}</p>
    </GuideCard>
  );
}

function PlayerRow({ name, country, serving }: { name: string; country: string; serving: boolean }) {
  const { g } = useGuide();
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="font-semibold">
        <span className="mr-1.5">{FLAGS[country] ?? country}</span>
        {name}
      </p>
      {serving ? <span className="text-[0.58rem] font-bold tracking-wide text-green-deep uppercase">{g.serving}</span> : null}
    </div>
  );
}
