"use client";

import Image from "next/image";
import Link from "next/link";
import { FLAGS } from "@/lib/flags";
import data from "@/lib/players.json";
import { ROUTES } from "@/lib/routes";
import { useGuide } from "./GuideUi";

type Player = {
  id: number;
  name: string;
  country: string;
  rank: number | null;
  careerHigh?: number | null;
  image: string | null;
};

const players = [...(data.mainDraw as Player[])].sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));

function Chip({ player, nowLabel, careerLabel }: { player: Player; nowLabel: string; careerLabel: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5 px-3 py-2">
      <span className="relative h-9 w-9 overflow-hidden rounded-full bg-ink/10">
        {player.image ? (
          <Image src={player.image} alt="" fill className="object-cover object-top" sizes="36px" />
        ) : (
          <span className="flex h-full items-center justify-center text-[0.58rem] font-bold text-ink/40">
            {player.name.slice(0, 1)}
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="text-[0.95rem] leading-none">{FLAGS[player.country] ?? ""}</span>
          <span className="font-display text-[0.82rem] font-bold whitespace-nowrap">{player.name}</span>
        </span>
        <span className="mt-0.5 flex gap-1.5 text-[0.58rem] font-bold tracking-wide text-ink/50 uppercase">
          {player.rank ? (
            <span>
              {nowLabel} #{player.rank}
            </span>
          ) : null}
          {player.careerHigh ? (
            <span>
              {careerLabel} #{player.careerHigh}
            </span>
          ) : null}
        </span>
      </span>
    </span>
  );
}

export function GuidePlayerMarquee() {
  const { t } = useGuide();

  return (
    <Link
      href={ROUTES.players}
      prefetch={false}
      className="block shrink-0 bg-yellow text-ink"
      aria-label={t.players.mainLabel}
    >
      <div className="marquee-viewport relative w-full overflow-hidden">
        <div className="marquee-track guide-marquee flex w-max items-center" aria-hidden>
          {[0, 1].map((copy) => (
            <div key={copy} className={copy === 1 ? "marquee-dup flex items-center" : "flex items-center"}>
              {players.map((player) => (
                <span key={`${copy}-${player.id}`} className="flex items-center">
                  <Chip player={player} nowLabel={t.players.nowLabel} careerLabel={t.players.careerLabel} />
                  <span className="h-8 w-px bg-ink/15" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
