"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { IconMegaphone } from "@/components/Icons";
import { FOOD_COURT_STANDS, MATCH_DAYS, PRESS_CONFERENCE, copy, pressConferenceUpcoming } from "@/lib/guide";
import { gCopy } from "@/lib/guide-content";
import { useLanguage } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";

export function useGuide() {
  const lang = useLanguage();
  return { ...lang, g: gCopy(lang.locale) };
}

export function LiveDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-2 w-2 ${className}`}>
      <span className="live-ping absolute inset-0 rounded-full bg-green" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
    </span>
  );
}

export function Pill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "live" | "yellow" | "ink";
}) {
  const tones = {
    muted: "bg-paper-soft text-ink/55",
    live: "bg-green/15 text-green-deep",
    yellow: "bg-yellow text-ink",
    ink: "bg-ink text-paper",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.62rem] font-bold tracking-wide uppercase ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function FoodStands({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid w-full min-w-0 grid-cols-2 gap-1.5 ${className}`}>
      {FOOD_COURT_STANDS.map((name) => (
        <li
          key={name}
          className="rounded-full bg-paper-soft px-2 py-[0.4rem] text-center text-[0.62rem] font-bold leading-tight text-ink/70"
        >
          {name}
        </li>
      ))}
    </ul>
  );
}

export function PressConferenceCard({
  href = ROUTES.events,
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  const { locale } = useGuide();
  if (!pressConferenceUpcoming()) return null;

  return (
    <GuideCard href={href} className={`bg-yellow text-ink ${className}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-yellow">
          <IconMegaphone className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-bold tracking-[0.14em] text-ink/55 uppercase">
            {copy(locale, PRESS_CONFERENCE.when)}
          </p>
          <p className="mt-1 font-display text-xl font-bold tracking-[-0.03em]">
            {copy(locale, PRESS_CONFERENCE.title)}
          </p>
          <p className="mt-1 text-sm font-bold text-ink/70">
            {PRESS_CONFERENCE.time} · {copy(locale, PRESS_CONFERENCE.place)}
          </p>
        </div>
      </div>
    </GuideCard>
  );
}

export function GuideCard({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const cls = `block overflow-hidden rounded-2xl border border-line-dark bg-paper p-4 ${className}`;
  if (href) {
    const external = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
    if (external) {
      return (
        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} prefetch={false} className={cls}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}

export function SectionHead({
  title,
  href,
  action,
}: {
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="font-display text-lg font-bold tracking-[-0.03em]">{title}</h2>
      {href && action ? (
        <Link href={href} prefetch={false} className="text-[0.82rem] font-bold tracking-wide text-ink/50">
          {action}
        </Link>
      ) : null}
    </div>
  );
}

export function DayTabs({
  selected,
  onSelect,
  days = MATCH_DAYS,
}: {
  selected: string;
  onSelect: (iso: string) => void;
  days?: typeof MATCH_DAYS;
}) {
  const { t } = useLanguage();

  return (
    <div className="guide-scroll flex min-w-0 gap-2 overflow-x-auto pb-1">
      {days.map((day) => {
        const i = MATCH_DAYS.findIndex((item) => item.iso === day.iso);
        const meta = t.schedule.days[i];
        const active = day.iso === selected;
        return (
          <button
            key={day.iso}
            type="button"
            onClick={() => onSelect(day.iso)}
            className={`shrink-0 rounded-2xl px-3 py-2 text-left ${
              active ? "bg-ink text-paper" : "bg-paper-soft text-ink/70"
            }`}
          >
            <span className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase opacity-70">
              {meta?.weekday}
            </span>
            <span className="block text-[0.88rem] font-bold">{meta?.date}</span>
          </button>
        );
      })}
    </div>
  );
}
