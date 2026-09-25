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

const mainDraw = data.mainDraw as Player[];
const qualifying = (data.qualifying ?? []) as Player[];

function matchesQuery(player: Player, q: string) {
  return player.name.toLowerCase().includes(q) || player.country.toLowerCase().includes(q);
}

function PlayerRow({ player, nowLabel, careerLabel, wtaLabel }: { player: Player; nowLabel: string; careerLabel: string; wtaLabel: string }) {
  return (
    <a
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
          {nowLabel} {player.rank ?? "—"}
          {player.careerHigh ? ` · ${careerLabel} ${player.careerHigh}` : ""}
        </span>
      </span>
      <span className="text-[0.62rem] font-bold tracking-wide text-ink/35 uppercase">{wtaLabel} ↗</span>
    </a>
  );
}

export function GuidePlayers() {
  const { g, t } = useGuide();
  const [query, setQuery] = useState("");

  const { main, qual } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sort = (list: Player[]) => [...list].sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
    if (!q) return { main: sort(mainDraw), qual: sort(qualifying) };
    return {
      main: sort(mainDraw.filter((p) => matchesQuery(p, q))),
      qual: sort(qualifying.filter((p) => matchesQuery(p, q))),
    };
  }, [query]);

  const empty = main.length === 0 && qual.length === 0;

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

      {empty ? (
        <p className="py-10 text-center text-sm text-ink/45">{g.noPlayers}</p>
      ) : (
        <>
          {main.length ? (
            <div className="mt-5 space-y-2">
              <p className="text-[0.7rem] font-bold tracking-[0.14em] text-ink/40 uppercase">{t.players.mainLabel}</p>
              {main.map((player) => (
                <PlayerRow key={player.id} player={player} nowLabel={t.players.nowLabel} careerLabel={t.players.careerLabel} wtaLabel={g.wtaProfile} />
              ))}
            </div>
          ) : null}

          {qual.length ? (
            <div className="mt-8 space-y-2">
              <p className="text-[0.7rem] font-bold tracking-[0.14em] text-ink/40 uppercase">{t.players.qualLabel}</p>
              <p className="text-sm text-ink/55">{t.players.qualLead}</p>
              {qual.map((player) => (
                <PlayerRow key={player.id} player={player} nowLabel={t.players.nowLabel} careerLabel={t.players.careerLabel} wtaLabel={g.wtaProfile} />
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
