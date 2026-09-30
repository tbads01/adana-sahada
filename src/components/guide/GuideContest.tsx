"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { IconClose } from "@/components/Icons";
import {
  contestOpen,
  normalizeTrMobile,
  parsePositiveInt,
  remainingToClose,
  type ContestLegalDoc,
} from "@/lib/contest";
import { DEFAULT_LEGAL } from "@/lib/contest-legal";
import { INSTAGRAM, INSTAGRAM_HANDLE, SITE_EMAIL, SITE_PHONE, SITE_PHONE_TEL } from "@/lib/site";
import { GuideCard, useGuide } from "./GuideUi";

type LegalKey = "kvkk" | "riza" | "rules" | "draw" | "marketing" | "retention";

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function formatPhoneInput(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length >= 12) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (!digits) return "";
  const local = `0${digits}`;
  if (local.length <= 4) return local;
  if (local.length <= 7) return `${local.slice(0, 4)} ${local.slice(4)}`;
  if (local.length <= 9) return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7, 9)} ${local.slice(9)}`;
}

export function ContestCountdown({ closed }: { closed?: boolean }) {
  const { g } = useGuide();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const remain = now == null ? null : remainingToClose(now);
  if (closed) return null;
  if (remain && !remain.open) return null;

  return (
    <div className="rounded-2xl bg-paper-soft px-4 py-3">
      <p className="text-[0.62rem] font-bold tracking-[0.14em] text-ink/45 uppercase">{g.contestDeadline}</p>
      <div className="mt-2 flex items-end gap-x-3.5">
        {[
          [remain ? pad(remain.days) : "––", g.contestDays],
          [remain ? pad(remain.hours) : "––", g.contestHours],
          [remain ? pad(remain.minutes) : "––", g.contestMinutes],
          [remain ? pad(remain.seconds) : "––", g.contestSeconds],
        ].map(([value, unit]) => (
          <div key={unit} className="shrink-0">
            <p className="font-display text-[1.35rem] leading-none font-extrabold tabular-nums">{value}</p>
            <p className="mt-1 text-[0.52rem] font-bold tracking-normal text-ink/40 uppercase">{unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkedText({
  text,
  links,
}: {
  text: string;
  links: { phrase: string; onOpen: () => void }[];
}) {
  const nodes: ReactNode[] = [];
  let rest = text;
  let key = 0;
  for (const link of links) {
    const i = rest.indexOf(link.phrase);
    if (i < 0) continue;
    if (i > 0) nodes.push(rest.slice(0, i));
    nodes.push(
      <button
        key={`l-${key++}`}
        type="button"
        className="inline border-0 bg-transparent p-0 font-bold underline underline-offset-2"
        onClick={link.onOpen}
      >
        {link.phrase}
      </button>,
    );
    rest = rest.slice(i + link.phrase.length);
  }
  if (rest) nodes.push(rest);
  return <>{nodes}</>;
}

function LegalDialog({
  title,
  body,
  onClose,
}: {
  title: string;
  body: string;
  onClose: () => void;
}) {
  const { g } = useGuide();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-ink/70" aria-label={g.contestClose} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[85svh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-line-dark bg-paper text-ink shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-start gap-3 border-b border-line-dark px-4 py-3">
          <h2 id={titleId} className="min-w-0 flex-1 font-display text-lg font-extrabold tracking-[-0.03em]">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-soft"
            onClick={onClose}
            aria-label={g.contestClose}
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-4 py-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/75">{body}</p>
          <p className="mt-4 text-[0.72rem] leading-relaxed text-ink/45">{g.contestDraftNote}</p>
        </div>
      </div>
    </div>
  );
}

export function ContestLegalLinks({
  legal,
  onOpen,
}: {
  legal: ContestLegalDoc;
  onOpen: (key: LegalKey) => void;
}) {
  const { g, locale } = useGuide();
  const lang = locale === "en" ? "en" : "tr";
  return (
    <div className="space-y-2 text-sm">
      <p className="text-[0.68rem] font-bold tracking-[0.12em] text-ink/40 uppercase">{g.contestLegalTitle}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {(
          [
            ["kvkk", g.contestLinkKvkk],
            ["riza", g.contestLinkRiza],
            ["rules", g.contestLinkRules],
            ["draw", g.contestLinkDraw],
            ["marketing", g.contestLinkMarketing],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className="font-bold underline underline-offset-2"
            onClick={() => onOpen(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-[0.72rem] leading-relaxed text-ink/45">{legal.retention[lang]}</p>
      <p className="pt-1 text-sm font-bold">{g.contestContact}</p>
      <p className="text-sm text-ink/65">
        <a className="font-bold underline underline-offset-2" href={`mailto:${SITE_EMAIL}`}>
          {SITE_EMAIL}
        </a>
        {" · "}
        <a className="font-bold underline underline-offset-2" href={`tel:${SITE_PHONE_TEL}`}>
          {SITE_PHONE}
        </a>
        {" · "}
        <a className="font-bold underline underline-offset-2" href={INSTAGRAM} target="_blank" rel="noreferrer">
          {INSTAGRAM_HANDLE}
        </a>
      </p>
    </div>
  );
}

export function GuideContest() {
  const { g, locale } = useGuide();
  const [legal, setLegal] = useState<ContestLegalDoc>(DEFAULT_LEGAL);
  const [open, setOpen] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [aces, setAces] = useState("");
  const [totalMinutes, setTotalMinutes] = useState("");
  const [finalMinutes, setFinalMinutes] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [riza, setRiza] = useState(false);
  const [rules, setRules] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [dialog, setDialog] = useState<LegalKey | null>(null);

  useEffect(() => {
    void fetch("/api/contest", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { open?: boolean; legal?: ContestLegalDoc }) => {
        if (typeof data.open === "boolean") setOpen(data.open);
        if (data.legal?.version) setLegal(data.legal);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const sync = () => setOpen(contestOpen());
    sync();
    const id = window.setInterval(sync, 1000);
    return () => window.clearInterval(id);
  }, []);

  const lang = locale === "en" ? "en" : "tr";
  const dialogTitle =
    dialog === "kvkk"
      ? g.contestLinkKvkk
      : dialog === "riza"
        ? g.contestLinkRiza
        : dialog === "rules"
          ? g.contestLinkRules
          : dialog === "draw"
            ? g.contestLinkDraw
            : dialog === "marketing"
              ? g.contestLinkMarketing
              : g.contestLegalTitle;
  const dialogBody = dialog ? legal[dialog][lang] : "";

  const field = "mt-1 w-full rounded-2xl border border-line-dark bg-paper-soft px-4 py-3 text-sm outline-none focus:border-ink";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      setError(g.contestErrName);
      return;
    }
    if (!normalizeTrMobile(phone)) {
      setError(g.contestErrPhone);
      return;
    }
    if (parsePositiveInt(aces) == null || parsePositiveInt(totalMinutes) == null || parsePositiveInt(finalMinutes) == null) {
      setError(g.contestErrGuess);
      return;
    }
    if (!kvkk || !riza || !rules) {
      setError(g.contestErrConsent);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/contest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          aces,
          totalMinutes,
          finalMinutes,
          kvkk,
          riza,
          rules,
          marketing,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setDone(true);
        try {
          window.localStorage.setItem("ao_contest_done", "1");
        } catch {
          /* ignore */
        }
        return;
      }
      const map: Record<string, string> = {
        name: g.contestErrName,
        phone: g.contestErrPhone,
        guess: g.contestErrGuess,
        consent: g.contestErrConsent,
        duplicate: g.contestErrDup,
        closed: g.contestErrClosed,
        limit: g.contestErrLimit,
      };
      setError(map[data.error || ""] || g.contestErrGeneric);
      if (data.error === "closed") setOpen(false);
    } catch {
      setError(g.contestErrGeneric);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-4 py-5">
      <p className="text-[0.7rem] font-bold tracking-[0.16em] text-ink/45 uppercase">{g.contestCta}</p>
      <h1 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.04em]">{g.contestTitle}</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink/65">{g.contestLead}</p>

      <div className="mt-4">
        <ContestCountdown closed={!open} />
      </div>

      {done ? (
        <GuideCard className="mt-4 bg-yellow text-ink">
          <p className="font-display text-xl font-bold tracking-[-0.03em]">{g.contestSuccess}</p>
        </GuideCard>
      ) : !open ? (
        <GuideCard className="mt-4">
          <p className="text-sm leading-relaxed text-ink/75">{g.contestClosed}</p>
        </GuideCard>
      ) : (
        <GuideCard className="mt-4">
          <form onSubmit={(e) => void submit(e)} className="space-y-3" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-bold">
                {g.contestFirst}
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={field}
                  autoComplete="given-name"
                  required
                />
              </label>
              <label className="block text-sm font-bold">
                {g.contestLast}
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={field}
                  autoComplete="family-name"
                  required
                />
              </label>
            </div>
            <label className="block text-sm font-bold">
              {g.contestPhone}
              <input
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                className={field}
                inputMode="tel"
                autoComplete="tel"
                placeholder={g.contestPhoneHint}
                required
              />
            </label>
            <label className="block text-sm font-bold">
              {g.contestQ1}
              <input
                value={aces}
                onChange={(e) => setAces(e.target.value.replace(/\D/g, "").slice(0, 7))}
                className={field}
                inputMode="numeric"
                required
              />
            </label>
            <label className="block text-sm font-bold">
              {g.contestQ2}
              <input
                value={totalMinutes}
                onChange={(e) => setTotalMinutes(e.target.value.replace(/\D/g, "").slice(0, 7))}
                className={field}
                inputMode="numeric"
                required
              />
              <span className="mt-1 block text-[0.72rem] font-medium text-ink/50">{g.contestQ2Hint}</span>
            </label>
            <label className="block text-sm font-bold">
              {g.contestQ3}
              <input
                value={finalMinutes}
                onChange={(e) => setFinalMinutes(e.target.value.replace(/\D/g, "").slice(0, 7))}
                className={field}
                inputMode="numeric"
                required
              />
              <span className="mt-1 block text-[0.72rem] font-medium text-ink/50">{g.contestQ3Hint}</span>
            </label>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 text-sm leading-snug">
                <input
                  type="checkbox"
                  checked={kvkk}
                  onChange={(e) => setKvkk(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
                />
                <span>
                  <span className="mr-1 text-[0.62rem] font-bold tracking-[0.08em] text-ink/40 uppercase">{g.contestRequired}</span>
                  <LinkedText text={g.contestKvkk} links={[{ phrase: g.contestLinkKvkk, onOpen: () => setDialog("kvkk") }]} />
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm leading-snug">
                <input
                  type="checkbox"
                  checked={riza}
                  onChange={(e) => setRiza(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
                />
                <span>
                  <span className="mr-1 text-[0.62rem] font-bold tracking-[0.08em] text-ink/40 uppercase">{g.contestRequired}</span>
                  <LinkedText text={g.contestRiza} links={[{ phrase: g.contestLinkRiza, onOpen: () => setDialog("riza") }]} />
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm leading-snug">
                <input
                  type="checkbox"
                  checked={rules}
                  onChange={(e) => setRules(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
                />
                <span>
                  <span className="mr-1 text-[0.62rem] font-bold tracking-[0.08em] text-ink/40 uppercase">{g.contestRequired}</span>
                  <LinkedText
                    text={g.contestRules}
                    links={[
                      { phrase: g.contestLinkRules, onOpen: () => setDialog("rules") },
                      { phrase: g.contestLinkDraw, onOpen: () => setDialog("draw") },
                    ]}
                  />
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm leading-snug">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
                />
                <span>
                  <span className="mr-1 text-[0.62rem] font-bold tracking-[0.08em] text-ink/40 uppercase">{g.contestOptional}</span>
                  <LinkedText
                    text={g.contestMarketing}
                    links={[{ phrase: g.contestLinkMarketing, onOpen: () => setDialog("marketing") }]}
                  />{" "}
                  <button type="button" className="font-bold underline underline-offset-2" onClick={() => setDialog("marketing")}>
                    {g.contestLinkMarketing}
                  </button>
                </span>
              </label>
            </div>

            {error ? <p className="text-sm font-bold text-ink/70">{error}</p> : null}

            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              {g.contestSubmit}
            </button>
          </form>
        </GuideCard>
      )}

      <div className="mt-6">
        <ContestLegalLinks legal={legal} onOpen={setDialog} />
      </div>

      {dialog ? (
        <LegalDialog title={dialogTitle} body={dialogBody} onClose={() => setDialog(null)} />
      ) : null}
    </div>
  );
}
