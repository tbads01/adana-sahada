"use client";

import Image from "next/image";
import { useGuide } from "./GuideUi";

export function GuideSponsors() {
  const { g, t } = useGuide();

  return (
    <div>
      <p className="mb-3 font-display text-lg font-bold tracking-[-0.03em]">{g.sponsors}</p>
      <div className="overflow-hidden rounded-2xl bg-ink p-4">
        <Image
          src="/media/partners/sponsors.webp"
          alt={t.partners.title}
          width={1211}
          height={402}
          className="h-auto w-full"
          sizes="(max-width:448px) 100vw, 448px"
        />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink/45">{t.partners.body}</p>
    </div>
  );
}
