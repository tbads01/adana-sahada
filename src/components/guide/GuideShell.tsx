"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  IconCalendar,
  IconInfo,
  IconLive,
  IconNow,
  IconSpark,
} from "@/components/Icons";
import { ROUTES } from "@/lib/routes";
import { tournamentPhase } from "@/lib/guide";
import { LiveDot, useGuide } from "./GuideUi";
import { GuideNotify } from "./GuideNotify";
import { GuidePlayerMarquee } from "./GuidePlayerMarquee";

const TABS = [
  { href: ROUTES.home, key: "now" as const, icon: IconNow },
  { href: ROUTES.matches, key: "matches" as const, icon: IconCalendar },
  { href: ROUTES.events, key: "events" as const, icon: IconSpark },
  { href: ROUTES.live, key: "live" as const, icon: IconLive },
  { href: ROUTES.info, key: "info" as const, icon: IconInfo },
];

export function GuideShell({ children }: { children: ReactNode }) {
  const { g, locale, setLocale } = useGuide();
  const pathname = usePathname();
  const live = tournamentPhase() === "live";

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div className="h-svh overflow-x-hidden bg-void">
      <div className="mx-auto flex h-svh w-full min-w-0 max-w-md flex-col overflow-hidden bg-paper text-ink md:shadow-[0_0_80px_rgba(0,0,0,0.35)]">
        <header className="shrink-0 border-b border-white/10 bg-ink text-paper pt-[env(safe-area-inset-top)]">
          <div className="flex h-14 min-w-0 items-center gap-3 px-4">
            <Link href={ROUTES.home} prefetch={false} className="flex min-w-0 items-center gap-2.5">
              <span className="relative h-8 w-[3.2rem] overflow-hidden">
                <Image src="/logo-clear.png" alt="Adana Open" fill className="object-contain object-left" sizes="52px" priority />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.68rem] font-bold tracking-[0.14em] text-yellow uppercase">{g.heroKicker}</span>
                <span className="block truncate text-[0.92rem] font-bold">{g.short}</span>
              </span>
            </Link>
            <div className="ml-auto flex items-center gap-1.5">
              <GuideNotify tone="header" />
              {live ? (
                <span className="mr-1 inline-flex items-center gap-1.5 rounded-full bg-green/20 px-2 py-1 text-[0.58rem] font-bold tracking-wide text-green uppercase">
                  <LiveDot />
                  Live
                </span>
              ) : null}
              <div className="flex items-center rounded-full bg-white/10 p-0.5 text-[0.72rem] font-bold">
                <button
                  type="button"
                  onClick={() => setLocale("tr")}
                  className={`rounded-full px-2.5 py-1 uppercase ${locale === "tr" ? "bg-yellow text-ink" : "text-paper/50"}`}
                >
                  TR
                </button>
                <button
                  type="button"
                  onClick={() => setLocale("en")}
                  className={`rounded-full px-2.5 py-1 uppercase ${locale === "en" ? "bg-yellow text-ink" : "text-paper/50"}`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </header>

        <GuidePlayerMarquee />

        <main id="main-content" className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>

        <nav
          className="min-w-0 shrink-0 overflow-hidden border-t border-white/10 bg-ink text-paper pb-[env(safe-area-inset-bottom)]"
          aria-label={g.short}
        >
          <div className="grid w-full grid-cols-5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active =
                tab.href === ROUTES.home
                  ? pathname === ROUTES.home || pathname === ROUTES.news || pathname === ROUTES.players
                  : pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  prefetch={false}
                  className={`flex min-w-0 flex-col items-center gap-1 px-1 py-2.5 ${
                    active ? "text-yellow" : "text-paper/55"
                  }`}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  <span className="w-full text-center text-[0.72rem] font-bold leading-tight">
                    {g[tab.key]}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
