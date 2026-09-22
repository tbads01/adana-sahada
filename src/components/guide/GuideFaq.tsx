"use client";

import { useEffect, useState } from "react";
import { IconChevron } from "@/components/Icons";
import { FAQS, copy } from "@/lib/guide";
import { ROUTES } from "@/lib/routes";
import { GuideCard, SectionHead, useGuide } from "./GuideUi";

export function GuideFaq({
  id = "sss",
  preview,
}: {
  id?: string;
  preview?: number;
}) {
  const { g, locale } = useGuide();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const entry = FAQS[0];
  const rest = preview != null ? FAQS.slice(1, 1 + preview) : FAQS.slice(1);

  useEffect(() => {
    if (window.location.hash !== `#${id}`) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [id]);

  return (
    <div id={id} className="scroll-mt-4">
      <SectionHead title={g.faq} href={preview != null ? `${ROUTES.info}#sss` : undefined} action={preview != null ? g.seeAll : undefined} />
      <GuideCard className="bg-yellow text-ink">
        <p className="font-display text-lg font-bold tracking-[-0.03em]">{copy(locale, entry.q)}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{copy(locale, entry.a)}</p>
      </GuideCard>
      <div className="mt-2 divide-y divide-line-dark overflow-hidden rounded-2xl border border-line-dark bg-paper">
        {rest.map((faq, i) => {
          const open = openFaq === i;
          return (
            <button
              key={copy(locale, faq.q)}
              type="button"
              aria-expanded={open}
              onClick={() => setOpenFaq(open ? null : i)}
              className="w-full px-4 py-3.5 text-left"
            >
              <span className="flex items-start justify-between gap-3">
                <p className="font-display text-base font-bold tracking-[-0.02em]">{copy(locale, faq.q)}</p>
                <IconChevron className={`mt-0.5 h-4 w-4 shrink-0 text-ink/35 transition-transform ${open ? "rotate-90" : ""}`} />
              </span>
              {open ? <p className="mt-2 text-sm leading-relaxed text-ink/60">{copy(locale, faq.a)}</p> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
