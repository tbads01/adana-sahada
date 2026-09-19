"use client";

import { useEffect, useState } from "react";
import { IconBell } from "@/components/Icons";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/push";
import { pickNextMatch } from "@/lib/guide";
import { GuideCard, useGuide } from "./GuideUi";

const MATCH_ALERT_KEY = "adana-open-match-alert";

async function ensureWorker() {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

export function GuideNotify({ tone = "card" }: { tone?: "card" | "hero" | "header" }) {
  const { g, t } = useGuide();
  const [state, setState] = useState<"idle" | "on" | "denied" | "need-https" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setState("need-https");
      return;
    }
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    void ensureWorker();
    if (Notification.permission === "granted") setState("on");
    if (Notification.permission === "denied") setState("denied");
  }, []);

  useEffect(() => {
    if (state !== "on" || !("Notification" in window)) return;
    const tick = () => {
      const next = pickNextMatch(t.schedule.days);
      if (!next || next.isLive) return;
      const start = next.event.time.split("–")[0];
      const key = `${next.iso}-${start}`;
      if (window.localStorage.getItem(MATCH_ALERT_KEY) === key) return;
      const [h, m] = start.split(":").map(Number);
      const when = new Date(`${next.iso}T${String(h).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}:00+03:00`);
      const delta = when.getTime() - Date.now();
      if (delta > 12 * 60_000 || delta < 30_000) return;
      window.localStorage.setItem(MATCH_ALERT_KEY, key);
      void new Notification(g.nextMatch, {
        body: `${next.event.title} · ${start}`,
        icon: "/icon-192.png",
      });
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [g.nextMatch, state, t.schedule.days]);

  async function enable() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "idle");
        return;
      }
      const reg = await ensureWorker();
      if (!reg) {
        setState("error");
        return;
      }
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const json = sub.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      setState(res.ok ? "on" : "error");
    } catch {
      setState("error");
    }
  }

  const copy =
    state === "on"
      ? g.notifyOn
      : state === "denied"
        ? g.notifyDenied
        : state === "need-https"
          ? g.notifyNeedHttps
          : state === "error"
            ? g.notifyError
            : g.notifyBody;

  const showButton = state === "idle" || state === "error";

  if (tone === "header") {
    return (
      <button
        type="button"
        onClick={() => {
          if (showButton) void enable();
        }}
        aria-label={showButton ? g.notifyEnable : copy}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          state === "on" ? "bg-green/20 text-green" : "bg-yellow text-ink"
        }`}
      >
        <IconBell className="h-4 w-4" />
      </button>
    );
  }

  if (tone === "hero") {
    if (state === "on" || state === "denied") return null;
    const label = state === "need-https" ? g.notifyNeedHttps : state === "denied" ? g.notifyDenied : g.notifyEnable;
    return (
      <button
        type="button"
        onClick={() => {
          if (showButton) void enable();
        }}
        className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-yellow px-3 py-3 text-left text-ink"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-yellow">
          <IconBell className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-bold leading-tight">{label}</span>
      </button>
    );
  }

  return (
    <GuideCard>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow text-ink">
          <IconBell className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold">{g.notifyTitle}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink/60">{copy}</p>
          {showButton ? (
            <button type="button" onClick={() => void enable()} className="btn btn-dark mt-3 !px-4 !py-2">
              {g.notifyEnable}
            </button>
          ) : null}
        </div>
      </div>
    </GuideCard>
  );
}
