"use client";

import { copy, sortedAnnouncements } from "@/lib/guide";
import { GuideCard, Pill, useGuide } from "./GuideUi";

export function GuideNews() {
  const { g, locale } = useGuide();
  const items = sortedAnnouncements();

  return (
    <div className="px-4 py-5">
      <h1 className="font-display text-2xl font-extrabold tracking-[-0.04em]">{g.news}</h1>
      <p className="mt-1 text-sm text-ink/55">{g.tagline}</p>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/45">{g.emptyNews}</p>
        ) : (
          items.map((item) => (
            <GuideCard key={item.id} href={item.href}>
              <div className="flex items-center gap-2">
                <Pill>{copy(locale, item.tag)}</Pill>
                {item.pin ? <Pill tone="yellow">{g.pinned}</Pill> : null}
                <span className="ml-auto text-[0.7rem] text-ink/40">{item.date}</span>
              </div>
              <p className="mt-2 font-display text-lg font-bold tracking-[-0.02em]">{copy(locale, item.title)}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/60">{copy(locale, item.body)}</p>
            </GuideCard>
          ))
        )}
      </div>
    </div>
  );
}
