"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const locale = window.localStorage.getItem("adana-open-locale") === "en" ? "en" : "tr";
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, locale }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
