"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { IconCamera, IconFood, IconLive, IconSpark, IconTrophy } from "@/components/Icons";
import { ATTRACTIONS, MATCH_DAYS, activeOrNextMatchDay, copy } from "@/lib/guide";
import { DayTabs, GuideCard, Pill, SectionHead, useGuide } from "./GuideUi";
import { GuideSponsors } from "./GuideSponsors";

type Tag = "all" | "match" | "music" | "event";

const ATTRACTION_ICONS = {
  food: IconFood,
  photo: IconCamera,
  spark: IconSpark,
  music: IconLive,
  court: IconTrophy,
};

export function GuideEvents() {
  const { g, t, locale } = useGuide();
  const [selected, setSelected] = useState(activeOrNextMatchDay().iso);
  const [filter, setFilter] = useState<Tag>("all");
  const dayIndex = MATCH_DAYS.findIndex((d) => d.iso === selected);
  const day = t.schedule.days[dayIndex];

  const items = useMemo(() => {
    const list = day?.events ?? [];
    if (filter === "all") return list;
    return list.filter((item) => item.tag === filter);
  }, [day, filter]);

  const filters: { id: Tag; label: string }[] = [
    { id: "all", label: g.filterAll },
    { id: "match", label: g.filterMatch },
    { id: "music", label: g.filterMusic },
    { id: "event", label: g.filterEvent },
  ];

  return (
    <div className="px-4 py-5">
      <h1 className="font-display text-2xl font-extrabold tracking-[-0.04em]">{g.events}</h1>
      <p className="mt-1 text-sm text-ink/55">{t.experience.body}</p>

      <div className="mt-5">
        <SectionHead title={g.alwaysOn} />
        <div className="space-y-2">
          {ATTRACTIONS.map((item) => {
            const Icon = ATTRACTION_ICONS[item.icon];
            return (
              <GuideCard key={item.id}>
                <div className="flex gap-3">
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-paper-soft">
                    <Image src={item.image} alt="" fill className="object-cover" sizes="64px" />
                  </span>
                  <div className="min-w-0">
                    <span className="flex items-center gap-1.5 text-ink/40">
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="font-display text-base font-bold">{copy(locale, item.title)}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink/55">{copy(locale, item.body)}</p>
                  </div>
                </div>
              </GuideCard>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <SectionHead title={g.todayOnSite} />
        <DayTabs selected={selected} onSelect={setSelected} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1.5 text-[0.68rem] font-bold ${
              filter === item.id ? "bg-ink text-paper" : "bg-paper-soft text-ink/55"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink/45">{g.noEvents}</p>
        ) : (
          items.map((item) => (
            <GuideCard key={`${item.time}-${item.title}`}>
              <Pill tone={item.tag === "match" ? "ink" : item.tag === "music" ? "yellow" : "muted"}>
                {item.tag === "match" ? g.filterMatch : item.tag === "music" ? g.filterMusic : g.filterEvent}
              </Pill>
              <p className="mt-2 font-display text-lg font-bold tracking-[-0.02em]">{item.title}</p>
              <p className="mt-1 text-sm font-bold tabular-nums text-ink/55">{item.time}</p>
            </GuideCard>
          ))
        )}
      </div>

      <div className="mt-8">
        <GuideSponsors />
      </div>
    </div>
  );
}
