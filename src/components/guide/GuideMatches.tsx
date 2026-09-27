"use client";

import { useMemo, useState } from "react";
import {
  MATCH_DAYS,
  activeOrNextMatchDay,
  displayStart,
  istanbulClock,
  namedBoardFor,
} from "@/lib/guide";
import { roundKind, type CourtId, type MatchRound } from "@/lib/match-plan";
import { WTA_URL } from "@/lib/site";
import { pickFocusDay } from "@/lib/wta-scores";
import { WtaCourtList, WtaDrawList } from "./GuideOrder";
import { useWtaScores } from "./useWtaScores";
import { CourtLabel, DayTabs, GuideCard, SectionHead, useGuide } from "./GuideUi";

export function GuideMatches() {
  const { g, t } = useGuide();
  const playable = useMemo(() => MATCH_DAYS.filter((d) => d.courts.length), []);
  const fallback = namedBoardFor()?.iso ?? activeOrNextMatchDay().iso;
  const [picked, setPicked] = useState<string | null>(null);
  const wta = useWtaScores();
  const selected = picked ?? pickFocusDay(wta.days, istanbulClock().iso)?.iso ?? fallback;
  const day = playable.find((d) => d.iso === selected) ?? playable[0];
  const dayIndex = MATCH_DAYS.findIndex((d) => d.iso === selected);
  const meta = t.schedule.days[dayIndex];
  const wtaDay = wta.days.find((item) => item.iso === selected);
  const start = wtaDay?.start || day.start;
  const total = wtaDay ? wtaDay.courts.reduce((n, court) => n + court.matches.length, 0) : day.total;
  const courts = wtaDay?.courts.map((court) => court.courtId) ?? day.courts.map((court) => court.id);

  return (
    <div className="px-4 py-5">
      <h1 className="font-display text-2xl font-extrabold tracking-[-0.04em]">{g.matches}</h1>
      <p className="mt-1 text-sm text-ink/55">{g.draftNote}</p>

      <div className="mt-4">
        <DayTabs selected={selected} onSelect={setPicked} days={playable} />
      </div>

      <GuideCard className="mt-4 !bg-surface">
        <p className="text-[0.62rem] font-bold tracking-[0.14em] text-ink/40 uppercase">{meta?.stage}</p>
        <p className="mt-1 font-display text-xl font-bold">{meta?.date}</p>
        <p className="mt-2 text-sm text-ink/55">
          {g.firstBall} · {displayStart(start, g.timeSoon)} · {total} {g.matchesCount}
        </p>
        <p className="mt-1 text-sm font-bold text-ink/70">
          {courts.map((id) => {
            const named = t.schedule.courtNamed[id as CourtId];
            return named ? `${t.schedule.courts[id as CourtId]} · ${named}` : t.schedule.courts[id as CourtId];
          }).join(" · ")}
        </p>
      </GuideCard>

      <div className="mt-6">
        <SectionHead title={t.schedule.matchEyebrow} />
        {wtaDay ? (
          <div className="mt-3">
            <WtaCourtList day={wtaDay} />
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {day.courts.map((court) => (
              <GuideCard key={court.id}>
                <CourtLabel id={court.id as CourtId} />
                <p className="mt-0.5 text-sm font-bold text-ink/50">
                  {g.firstBall} · {displayStart(court.start, g.timeSoon)}
                </p>
                <ol className="mt-3 space-y-2">
                  {court.slots.map((round, i) => (
                    <li key={`${court.id}-${round}-${i}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2">
                        <RoundChip round={round} />
                        <span className="font-semibold">{t.schedule.rounds[round]}</span>
                      </span>
                      <span className="shrink-0 text-right text-ink/40">
                        {i === 0 ? displayStart(court.start, g.timeSoon) : g.followedBy}
                      </span>
                    </li>
                  ))}
                </ol>
              </GuideCard>
            ))}
          </div>
        )}
      </div>

      {wta.draw.length ? (
        <div className="mt-8">
          <SectionHead title={g.mainDraw} />
          <p className="mt-1 text-sm text-ink/55">{g.mainDrawNote}</p>
          <div className="mt-3">
            <WtaDrawList pairs={wta.draw} />
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 text-[0.62rem] font-bold uppercase">
        <span className="rounded-full bg-green/15 px-2 py-1 text-green-deep">{g.legendQual}</span>
        <span className="rounded-full bg-ink px-2 py-1 text-paper">{g.legendSingles}</span>
        <span className="rounded-full bg-yellow px-2 py-1 text-ink">{g.legendDoubles}</span>
      </div>

      <a href={WTA_URL} target="_blank" rel="noreferrer" className="btn btn-dark mt-6 w-full">
        {g.officialScores} ↗
      </a>
    </div>
  );
}

function RoundChip({ round }: { round: MatchRound }) {
  const kind = roundKind(round);
  const cls =
    kind === "qual" ? "bg-green/15 text-green-deep" : kind === "doubles" ? "bg-yellow text-ink" : "bg-ink text-paper";
  return <span className={`rounded-full px-2 py-0.5 text-[0.58rem] font-bold ${cls}`}>{round}</span>;
}
