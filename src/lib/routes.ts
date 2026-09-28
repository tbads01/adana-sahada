import { MAIN_SITE_URL, ORANION_URL, TICKETS_URL } from "./site";

export const ROUTES = {
  home: "/",
  matches: "/maclar",
  events: "/etkinlikler",
  news: "/duyurular",
  live: "/canli",
  info: "/bilgi",
  players: "/oyuncular",
  send: "/gonder",
  admin: "/admin",
  tickets: TICKETS_URL,
  oranion: ORANION_URL,
  site: MAIN_SITE_URL,
} as const;

export const ROUTES = {
  home: "/",
  matches: "/maclar",
  events: "/etkinlikler",
  news: "/duyurular",
  live: "/canli",
  info: "/bilgi",
  players: "/oyuncular",
  send: "/gonder",
  admin: "/admin",
  tickets: TICKETS_URL,
  site: MAIN_SITE_URL,
} as const;
