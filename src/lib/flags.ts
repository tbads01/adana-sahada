const WORLD_FLAG = "🌍";
const NEUTRAL_FLAGS = new Set(["RUS", "BLR"]);

export const FLAGS: Record<string, string> = {
  ARG: "🇦🇷",
  ARM: "🇦🇲",
  AND: "🇦🇩",
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
  SRB: "🇷🇸",
  SUI: "🇨🇭",
  TUR: "🇹🇷",
  USA: "🇺🇸",
};

export function flagFor(country: string) {
  if (NEUTRAL_FLAGS.has(country)) return WORLD_FLAG;
  return FLAGS[country] ?? "";
}
