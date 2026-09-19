"use client";

import { useEffect, useState } from "react";
import { ROUTES } from "@/lib/routes";
import { GuideCard, useGuide } from "./GuideUi";

const PRESETS = [
  { id: "match" as const, url: ROUTES.matches, title: { tr: "Sıradaki maç", en: "Next match" }, message: { tr: "Merkez Kort · saat yaklaşıyor.", en: "Centre Court · first ball soon." } },
  { id: "news" as const, url: ROUTES.news, title: { tr: "Duyuru", en: "Announcement" }, message: { tr: "Yeni bir duyuru var.", en: "There’s a new announcement." } },
  { id: "live" as const, url: ROUTES.live, title: { tr: "Canlı yayın", en: "Livestream" }, message: { tr: "Yayın açık. Canlı sayfasından izleyin.", en: "The stream is live. Watch from the Live page." } },
];

export function GuideSend() {
  const { g, locale } = useGuide();
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState<string>(ROUTES.home);
  const [preset, setPreset] = useState<"match" | "news" | "live" | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [sent, setSent] = useState(0);

  useEffect(() => {
    void fetch("/api/push/status")
      .then((res) => res.json())
      .then((data: { count?: number }) => setCount(data.count ?? 0))
      .catch(() => setCount(0));
  }, []);

  function applyPreset(id: (typeof PRESETS)[number]["id"]) {
    const item = PRESETS.find((p) => p.id === id);
    if (!item) return;
    setPreset(id);
    setTitle(item.title[locale]);
    setMessage(item.message[locale]);
    setUrl(item.url);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    const res = await fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, title, message, url }),
    });
    const data = (await res.json()) as { ok?: boolean; sent?: number };
    if (res.ok && data.ok) {
      setStatus("ok");
      setSent(data.sent ?? 0);
      setTitle("");
      setMessage("");
    } else {
      setStatus("fail");
    }
  }

  const field = "mt-1 w-full rounded-2xl border border-line-dark bg-paper-soft px-4 py-3 text-sm outline-none focus:border-ink";

  return (
    <div className="px-4 py-5">
      <h1 className="font-display text-2xl font-extrabold tracking-[-0.04em]">{g.sendTitle}</h1>
      <p className="mt-1 text-sm text-ink/55">{g.sendHow}</p>
      {count != null ? (
        <p className="mt-2 text-sm font-bold text-ink/45">
          {count} {g.sendCount}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => applyPreset(item.id)}
            className={`rounded-full px-3 py-1.5 text-[0.72rem] font-bold ${
              preset === item.id ? "bg-ink text-paper" : "bg-paper-soft text-ink/60"
            }`}
          >
            {item.id === "match" ? g.sendPresetMatch : item.id === "news" ? g.sendPresetNews : g.sendPresetLive}
          </button>
        ))}
      </div>

      <GuideCard className="mt-4">
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <label className="block text-sm font-bold">
            {g.sendPassword}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} required />
          </label>
          <label className="block text-sm font-bold">
            {g.sendHeadline}
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} required />
          </label>
          <label className="block text-sm font-bold">
            {g.sendMessage}
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className={`${field} min-h-24`} required />
          </label>
          <label className="block text-sm font-bold">
            {g.sendLink}
            <input value={url} onChange={(e) => setUrl(e.target.value)} className={field} />
          </label>
          <button type="submit" className="btn btn-primary w-full">
            {g.sendCta}
          </button>
          {status === "ok" ? (
            <p className="text-sm font-bold text-green-deep">
              {g.sendOk} · {sent}
            </p>
          ) : null}
          {status === "fail" ? <p className="text-sm font-bold text-ink/55">{g.sendFail}</p> : null}
        </form>
      </GuideCard>
    </div>
  );
}
