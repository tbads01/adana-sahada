"use client";

import { flagFor } from "@/lib/flags";
import { copy, getLiveData, SOCIAL_LINKS } from "@/lib/guide";
import { INSTAGRAM, WTA_URL } from "@/lib/site";
import { IconPlay } from "@/components/Icons";
import { GuideCard, LiveDot, Pill, SectionHead, useGuide } from "./GuideUi";

export function GuideLive() {
  const { g, t, locale } = useGuide();
  const live = getLiveData();
  const streamUrl = live.stream.url;
  const liveNow = live.stream.status === "live" && Boolean(streamUrl);

  return (
    <div className="px-4 py-5">
      <h1 className="font-display text-2xl font-extrabold tracking-[-0.04em]">{g.live}</h1>
      <p className="mt-1 text-sm text-ink/55">{g.streamHint}</p>

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
            <p className="mt-2 max-w-xs text-sm text-paper/55">{g.streamOffline}</p>
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

      <div className="mt-8">
        <SectionHead title={g.scoreboard} />
        {live.scoreboard.length === 0 ? (
          <p className="text-sm text-ink/50">{g.scoreboardEmpty}</p>
        ) : (
          <div className="space-y-2">
            {live.scoreboard.map((row) => (
              <GuideCard key={`${row.courtId}-${row.a.name}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{t.schedule.courts[row.courtId]}</p>
                    {t.schedule.courtNamed[row.courtId] ? (
                      <p className="text-[0.7rem] font-bold text-ink/45">{t.schedule.courtNamed[row.courtId]}</p>
                    ) : null}
                  </div>
                  <Pill tone={row.status === "live" ? "live" : "muted"}>
                    {row.status === "live" ? <LiveDot /> : null}
                    {row.status === "live" ? g.onCourt : g.upNext}
                  </Pill>
                </div>
                <p className="mt-2 text-sm font-semibold">
                  {flagFor(row.a.country)} {row.a.name} · {flagFor(row.b.country)} {row.b.name}
                </p>
                <p className="mt-1 font-display text-lg font-extrabold tabular-nums">
                  {row.sets.map((set) => set.join("–")).join("  ") || "0–0"}
                </p>
              </GuideCard>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <SectionHead title={g.social} />
        <div className="space-y-2">
          {SOCIAL_LINKS.map((item) => (
            <GuideCard key={item.id} href={item.href}>
              <p className="font-display text-base font-bold">{copy(locale, item.label)}</p>
            </GuideCard>
          ))}
        </div>
      </div>
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
