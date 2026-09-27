/** Neutral world mark used where national flags are barred (RUS / BLR). */
export const WORLD_FLAG = "🌐";

const NEUTRAL_CODES = new Set(["RUS", "BLR", "WLD"]);

export const FLAGS: Record<string, string> = {
  AND: "🇦🇩",
  ARG: "🇦🇷",
  ARM: "🇦🇲",
  AUS: "🇦🇺",
  AUT: "🇦🇹",
  BUL: "🇧🇬",
  CAN: "🇨🇦",
  COL: "🇨🇴",
  CRO: "🇭🇷",
  CZE: "🇨🇿",
  FRA: "🇫🇷",
  GEO: "🇬🇪",
  GER: "🇩🇪",
  HUN: "🇭🇺",
  ITA: "🇮🇹",
  LAT: "🇱🇻",
  NED: "🇳🇱",
  POL: "🇵🇱",
  ROU: "🇷🇴",
  SRB: "🇷🇸",
  SUI: "🇨🇭",
  SVK: "🇸🇰",
  TUR: "🇹🇷",
  USA: "🇺🇸",
  BLR: WORLD_FLAG,
  RUS: WORLD_FLAG,
  WLD: WORLD_FLAG,
};

export function flagFor(country: string) {
  if (NEUTRAL_CODES.has(country)) return WORLD_FLAG;
  return FLAGS[country] ?? "";
}

export function countryLabel(code: string, world: string) {
  return NEUTRAL_CODES.has(code) ? world : code;
}
