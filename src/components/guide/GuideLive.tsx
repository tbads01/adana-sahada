"use client";

import { getLiveData, istanbulClock } from "@/lib/guide";
import { INSTAGRAM, WTA_URL } from "@/lib/site";
import { IconPlay } from "@/components/Icons";
import { SectionHead, useGuide } from "./GuideUi";
import { useWtaScores } from "./useWtaScores";
import { WtaCourtList, WtaMatchRow } from "./GuideOrder";
import { pickFocusDay } from "@/lib/wta-scores";

export function GuideLive() {
  const { g } = useGuide();
  const live = getLiveData();
  const wta = useWtaScores();
  const streamUrl = live.stream.url;
  const liveNow = live.stream.status === "live" && Boolean(streamUrl);
  const clock = istanbulClock();
  const onCourt = wta.matches.filter((row) => row.state === "live");
  const board = pickFocusDay(wta.days, clock.iso);

  return (
    <div className="px-4 py-5">
      <h1 className="font-display text-2xl font-extrabold tracking-[-0.04em]">{g.live}</h1>

      <div className="mt-5 overflow-hidden rounded-2xl bg-ink text-paper">
        {liveNow ? (
          <div className="aspect-video">
            {streamUrl.includes("youtube.com") || streamUrl.includes("youtu.be") ? (
              <iframe
                title={g.streamLive}
                src={toEmbed(streamUrl)}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <a href={streamUrl} target="_blank" rel="noreferrer" className="flex h-full items-center justify-center gap-3">
                <IconPlay className="h-10 w-10 text-yellow" />
                <span className="font-display text-xl font-bold">{g.streamLive}</span>
              </a>
            )}
          </div>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow text-ink">
              <IconPlay className="h-6 w-6" />
            </span>
            <p className="mt-4 font-display text-xl font-bold">
              {live.stream.status === "ended" ? g.streamEnded : g.streamSoon}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-2">
        {liveNow ? (
          <a href={streamUrl} target="_blank" rel="noreferrer" className="btn btn-primary w-full">
            {g.streamLive} ↗
          </a>
        ) : null}
        <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="btn btn-dark w-full !px-3 text-center">
          {g.watchInstagram}
        </a>
        <a href={WTA_URL} target="_blank" rel="noreferrer" className="btn btn-ghost w-full">
          {g.officialScores} ↗
        </a>
      </div>

      {onCourt.length && !board ? (
        <div className="mt-8">
          <SectionHead title={g.onCourtNow} />
          <ol className="mt-3 divide-y divide-line-dark rounded-2xl bg-paper-soft px-4 py-3">
            {onCourt.map((row) => (
              <WtaMatchRow key={row.id} row={row} />
            ))}
          </ol>
        </div>
      ) : null}

      {board ? (
        <div className="mt-8">
          <SectionHead title={onCourt.length ? g.onCourtNow : board.iso === clock.iso ? g.todayMatches : g.upcomingMatches} />
          <div className="mt-3">
            <WtaCourtList day={board} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function toEmbed(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
    }
    const id = parsed.searchParams.get("v");
    if (id) return `https://www.youtube.com/embed/${id}`;
  } catch {
    /* keep original */
  }
  return url;
}
