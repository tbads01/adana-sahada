"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const REF_KEY = "adana-open-ref";

function landingReferrer() {
  try {
    const stored = window.sessionStorage.getItem(REF_KEY);
    if (stored != null) return stored;
    const params = new URLSearchParams(window.location.search);
    const tagged = params.get("utm_source") || params.get("ref") || "";
    const value = tagged || document.referrer || "";
    window.sessionStorage.setItem(REF_KEY, value);
    return value;
  } catch {
    return document.referrer || "";
  }
}

function ping(path: string, heartbeat: boolean) {
  const locale = window.localStorage.getItem("adana-open-locale") === "en" ? "en" : "tr";
  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, locale, referrer: landingReferrer(), ping: heartbeat }),
    keepalive: true,
  }).catch(() => undefined);
}

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    ping(pathname, false);

    const beat = () => {
      if (document.visibilityState === "hidden") return;
      ping(pathname, true);
    };
    const id = window.setInterval(beat, 20_000);
    const onVis = () => {
      if (document.visibilityState === "visible") beat();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [pathname]);

  return null;
}
