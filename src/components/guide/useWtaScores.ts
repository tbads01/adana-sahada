"use client";

import { useEffect, useState } from "react";
import type { WtaBoard } from "@/lib/wta-scores";

const EMPTY: WtaBoard = { updatedAt: null, matches: [], days: [], draw: [] };

export function useWtaScores() {
  const [board, setBoard] = useState<WtaBoard>(EMPTY);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await fetch("/api/scores", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as WtaBoard;
        if (!ignore && Array.isArray(data.matches)) {
          setBoard({
            updatedAt: data.updatedAt ?? null,
            matches: data.matches,
            days: Array.isArray(data.days) ? data.days : [],
            draw: Array.isArray(data.draw) ? data.draw : [],
          });
        }
      } catch {
        /* keep last good board */
      }
    };
    load();
    const id = window.setInterval(load, 20_000);
    return () => {
      ignore = true;
      window.clearInterval(id);
    };
  }, []);

  return board;
}
