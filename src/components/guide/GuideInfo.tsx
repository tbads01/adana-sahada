"use client";

import {
  IconCar,
  IconChild,
  IconFood,
  IconMail,
  IconPhone,
  IconPin,
  IconPlayers,
  IconSun,
  IconTicket,
  IconTrophy,
} from "@/components/Icons";
import { INFO_ITEMS, copy } from "@/lib/guide";
import {
  INSTAGRAM,
  MAPS_URL,
  SITE_EMAIL,
  SITE_PHONE,
  SITE_PHONE_TEL,
  TICKETS_URL,
} from "@/lib/site";
import { FoodStands, GuideCard, SectionHead, useGuide } from "./GuideUi";
import { GuideFaq } from "./GuideFaq";
import { GuideSponsors } from "./GuideSponsors";

const ICONS = {
  pin: IconPin,
  car: IconCar,
  ticket: IconTicket,
  food: IconFood,
  court: IconTrophy,
  player: IconPlayers,
  sun: IconSun,
  child: IconChild,
  phone: IconPhone,
  press: IconMail,
};

export function GuideInfo() {
  const { g, t, locale } = useGuide();

  return (
    <div className="px-4 py-5">
      <h1 className="font-display text-2xl font-extrabold tracking-[-0.04em]">{g.info}</h1>
      <p className="mt-1 text-sm text-ink/55">{t.venue.body}</p>

      <div className="mt-4 grid gap-2">
        <a href={TICKETS_URL} target="_blank" rel="noreferrer" className="btn btn-primary w-full">
          {g.ticketBuy}
        </a>
        <a href={MAPS_URL} target="_blank" rel="noreferrer" className="btn btn-dark w-full">
          {g.maps}
        </a>
        <div className="grid grid-cols-2 gap-2">
          <a href={`tel:${SITE_PHONE_TEL}`} className="btn btn-ghost w-full">
            {g.call}
          </a>
          <a href={`mailto:${SITE_EMAIL}`} className="btn btn-ghost w-full">
            {g.email}
          </a>
        </div>
      </div>

      <GuideCard className="mt-4 !bg-surface">
        <p className="text-[0.62rem] font-bold tracking-[0.14em] text-ink/40 uppercase">{t.venue.addressLabel}</p>
        <p className="mt-1 font-display text-lg font-bold">{t.venue.host}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink/60">{t.venue.address}</p>
        <p className="mt-3 text-sm text-ink/55">
          {t.venue.capacityLabel}: {t.venue.capacity}
        </p>
        <p className="text-sm text-ink/55">
          {t.venue.courtsLabel}: {t.venue.courts}
        </p>
      </GuideCard>

      <div className="mt-6">
        <GuideFaq />
      </div>

      <div className="mt-8">
        <SectionHead title={g.practical} />
        <div className="space-y-2">
          {INFO_ITEMS.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <GuideCard key={item.id} href={item.href}>
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-yellow text-ink">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-base font-bold">{copy(locale, item.title)}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink/60">{copy(locale, item.body)}</p>
                    {item.hrefLabel ? (
                      <p className="mt-2 text-[0.72rem] font-bold tracking-wide text-ink/45 uppercase">
                        {copy(locale, item.hrefLabel)} →
                      </p>
                    ) : null}
                  </div>
                </div>
                {item.id === "food" ? <FoodStands className="mt-3" /> : null}
              </GuideCard>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <SectionHead title={g.contact} />
        <div className="space-y-2">
          <GuideCard href={`tel:${SITE_PHONE_TEL}`}>
            <p className="text-[0.62rem] font-bold tracking-[0.14em] text-ink/40 uppercase">{g.call}</p>
            <p className="mt-1 font-display text-lg font-bold">{SITE_PHONE}</p>
          </GuideCard>
          <GuideCard href={`mailto:${SITE_EMAIL}`}>
            <p className="text-[0.62rem] font-bold tracking-[0.14em] text-ink/40 uppercase">{g.email}</p>
            <p className="mt-1 font-display text-lg font-bold">{SITE_EMAIL}</p>
          </GuideCard>
          <GuideCard href={INSTAGRAM}>
            <p className="text-[0.62rem] font-bold tracking-[0.14em] text-ink/40 uppercase">{g.instagram}</p>
            <p className="mt-1 font-display text-lg font-bold">{INSTAGRAM.replace("https://www.instagram.com/", "@")}</p>
          </GuideCard>
        </div>
      </div>

      <div className="mt-8">
        <GuideSponsors />
      </div>

      <p className="mt-6 text-center text-[0.7rem] text-ink/35">{g.installHint}</p>
    </div>
  );
}
