const WORLD_FLAG = "🌍";
const NEUTRAL_FLAGS = new Set(["RUS", "BLR"]);

export const FLAGS: Record<string, string> = {
  AND: "🇦🇩",
  ARG: "🇦🇷",
  ARM: "🇦🇲",
  AUT: "🇦🇹",
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
  SVK: "🇸🇰",
  TUR: "🇹🇷",
  USA: "🇺🇸",
};

export function flagFor(country: string) {
  if (NEUTRAL_FLAGS.has(country)) return WORLD_FLAG;
  return FLAGS[country] ?? "";
}
