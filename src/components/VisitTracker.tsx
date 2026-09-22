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

function locale() {
  return window.localStorage.getItem("adana-open-locale") === "en" ? "en" : "tr";
}

function ping(path: string, extra: Record<string, unknown> = {}) {
  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, locale: locale(), referrer: landingReferrer(), ...extra }),
    keepalive: true,
  }).catch(() => undefined);
}

function isBiletix(href: string) {
  try {
    return new URL(href, window.location.href).hostname.replace(/^www\./, "").includes("biletix.");
  } catch {
    return false;
  }
}

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    ping(pathname);

    const beat = () => {
      if (document.visibilityState === "hidden") return;
      ping(pathname, { ping: true });
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

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    function onClick(event: MouseEvent) {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (!link?.href || !isBiletix(link.href)) return;
      ping(window.location.pathname.split("?")[0] || "/", { event: "ticket" });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return null;
}
