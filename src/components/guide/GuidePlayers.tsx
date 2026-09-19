"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { flagFor } from "@/lib/flags";
import { useGuide } from "./GuideUi";
import data from "@/lib/players.json";

type Player = {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  country: string;
  rank: number | null;
  careerHigh?: number | null;
  wtaUrl: string;
  image: string | null;
  entry?: string;
};

const players = data.mainDraw as Player[];

export function GuidePlayers() {
  const { g, t } = useGuide();
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...players].sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
    if (!q) return sorted;
    return sorted.filter((p) => p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="px-4 py-5">
      <h1 className="font-display text-2xl font-extrabold tracking-[-0.04em]">{g.players}</h1>
      <p className="mt-1 text-sm text-ink/55">{t.players.lead}</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={g.searchPlayers}
        className="mt-4 w-full rounded-2xl border border-line-dark bg-paper-soft px-4 py-3 text-sm outline-none focus:border-ink"
      />

      <div className="mt-4 space-y-2">
        {list.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/45">{g.noPlayers}</p>
        ) : (
          list.map((player) => (
            <a
              key={player.id}
              href={player.wtaUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-line-dark bg-paper p-3"
            >
              <span className="relative h-12 w-12 overflow-hidden rounded-full bg-paper-soft">
                {player.image ? (
                  <Image src={player.image} alt="" fill className="object-cover object-top" sizes="48px" />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs font-bold text-ink/40">
                    {player.lastName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-base font-bold">
                  {flagFor(player.country)} {player.name}
                </span>
                <span className="text-[0.7rem] font-bold tracking-wide text-ink/40 uppercase">
                  {t.players.nowLabel} {player.rank ?? "—"}
                  {player.careerHigh ? ` · ${t.players.careerLabel} ${player.careerHigh}` : ""}
                </span>
              </span>
              <span className="text-[0.62rem] font-bold tracking-wide text-ink/35 uppercase">{g.wtaProfile} ↗</span>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
