"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconClose, IconTrophy } from "@/components/Icons";
import { contestOpen } from "@/lib/contest";
import { ROUTES } from "@/lib/routes";
import { ContestCountdown } from "./GuideContest";
import { GuideCard, useGuide } from "./GuideUi";

const DISMISS_KEY = "ao_contest_promo";
const DONE_KEY = "ao_contest_done";

export function ContestPromo({ className = "" }: { className?: string }) {
  const { g } = useGuide();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(contestOpen());
    const id = window.setInterval(() => setOpen(contestOpen()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <GuideCard href={ROUTES.contest} className={`bg-paper text-ink ${className}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow text-ink">
          <IconTrophy className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-bold tracking-[0.14em] text-ink/55 uppercase">{g.contestCta}</p>
          <p className="mt-0.5 font-display text-xl font-bold tracking-[-0.03em]">{g.contestTitle}</p>
          <p className="mt-0.5 text-sm font-bold text-ink/70">{open ? g.contestOpenForm : g.contestDeadline} →</p>
        </div>
      </div>
    </GuideCard>
  );
}

export function ContestLaunchDialog() {
  const { g } = useGuide();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(contestOpen());
    const id = window.setInterval(() => setOpen(contestOpen()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (pathname === ROUTES.contest) return;
    try {
      if (window.localStorage.getItem(DONE_KEY) === "1") return;
      if (window.sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      return;
    }
    const t = window.setTimeout(() => setDialog(true), 400);
    return () => window.clearTimeout(t);
  }, [open, pathname]);

  function dismiss() {
    setDialog(false);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (!dialog) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [dialog]);

  if (!dialog) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-ink/70" aria-label={g.contestClose} onClick={dismiss} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-line-dark bg-paper text-ink shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-start gap-3 px-4 pt-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow text-ink">
            <IconTrophy className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.62rem] font-bold tracking-[0.14em] text-ink/45 uppercase">{g.contestCta}</p>
            <h2 id={titleId} className="mt-1 font-display text-xl font-extrabold tracking-[-0.03em]">
              {g.contestTitle}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-soft"
            onClick={dismiss}
            aria-label={g.contestClose}
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 px-4 py-4">
          <p className="text-sm leading-relaxed text-ink/70">{g.contestLead}</p>
          <ContestCountdown />
          <Link href={ROUTES.contest} prefetch={false} className="btn btn-primary w-full" onClick={dismiss}>
            {g.contestOpenForm}
          </Link>
        </div>
      </div>
    </div>
  );
}
