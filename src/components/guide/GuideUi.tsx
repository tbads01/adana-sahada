"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { MATCH_DAYS } from "@/lib/guide";
import { gCopy } from "@/lib/guide-content";
import { useLanguage } from "@/lib/i18n";

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
        <Link href={href} prefetch={false} className="text-[0.72rem] font-bold tracking-wide text-ink/45 uppercase">
          {action}
        </Link>
      ) : null}
    </div>
  );
}

export function DayTabs({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (iso: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="guide-scroll flex min-w-0 gap-2 overflow-x-auto pb-1">
      {MATCH_DAYS.map((day, i) => {
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
            <span className="block text-[0.58rem] font-bold tracking-[0.12em] uppercase opacity-70">
              {meta?.weekday}
            </span>
            <span className="block text-[0.78rem] font-bold">{meta?.date}</span>
          </button>
        );
      })}
    </div>
  );
}
