const TEAM_TONES: Record<string, string> = {
  KC: "#e31837",
  BUF: "#00338d",
  CIN: "#fb4f14",
  BAL: "#241773",
  CLE: "#311d00",
  PIT: "#ffb612",
  HOU: "#03202f",
  IND: "#002c5f",
  JAX: "#006778",
  TEN: "#0c2340",
  DEN: "#fb4f14",
  LV: "#a5acaf",
  LAC: "#0080c6",
  LAR: "#003594",
  SF: "#aa0000",
  SEA: "#002244",
  ARI: "#97233f",
  DAL: "#003594",
  NYG: "#0b2265",
  PHI: "#004c54",
  WAS: "#5a1414",
  GB: "#203731",
  CHI: "#0b162a",
  DET: "#0076b6",
  MIN: "#4f2683",
  ATL: "#a71930",
  CAR: "#0085ca",
  NO: "#d3bc8d",
  TB: "#d50a0a",
  MIA: "#008e97",
  NE: "#002244",
  NYJ: "#125740",
};

export function teamTone(abbreviation: string): string {
  return TEAM_TONES[abbreviation.toUpperCase()] ?? "#c8f542";
}

export function shortTeamName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] ?? fullName;
}
