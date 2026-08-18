export type SeasonType = 1 | 2 | 3; // preseason | regular | postseason

export type TeamSide = {
  teamId: string;
  name: string;
  abbreviation: string;
  score?: number;
  logo?: string;
};

export type Game = {
  gameId: string;
  week: number;
  season: number;
  seasonType: SeasonType;
  homeTeam: TeamSide;
  awayTeam: TeamSide;
  gameDate: string;
  status: "scheduled" | "in_progress" | "final" | "postponed";
  statusText: string;
  /** e.g. "Q2 5:42" or "Halftime" */
  clockLabel: string;
};

export type ScoreboardMeta = {
  week: number;
  season: number;
  seasonType: SeasonType;
  weekLabel: string;
  games: Game[];
};

type EspnCompetitor = {
  homeAway: "home" | "away";
  score?: string;
  team: {
    id: string;
    displayName?: string;
    name: string;
    abbreviation: string;
    logo?: string;
  };
};

type EspnEvent = {
  id: string;
  date: string;
  status: {
    displayClock?: string;
    period?: number;
    type: {
      name?: string;
      state?: string;
      description?: string;
      detail?: string;
      shortDetail?: string;
      completed?: boolean;
    };
  };
  competitions: Array<{ competitors: EspnCompetitor[] }>;
};

type EspnScoreboard = {
  week?: { number?: number };
  season?: { year?: number; type?: number };
  events?: EspnEvent[];
};

const ESPN_BASE =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

/** Preseason week labels (ESPN seasontype=1). */
export const PRESEASON_WEEKS = [
  { week: 1, label: "Hall of Fame" },
  { week: 2, label: "Preseason Week 2" },
  { week: 3, label: "Preseason Week 3" },
  { week: 4, label: "Preseason Week 4" },
] as const;

export const REGULAR_SEASON_WEEKS = Array.from({ length: 18 }, (_, index) => ({
  week: index + 1,
  label: `Week ${index + 1}`,
}));

export const SEASON_TYPES: Array<{ value: SeasonType; label: string }> = [
  { value: 1, label: "Preseason" },
  { value: 2, label: "Regular season" },
  { value: 3, label: "Playoffs" },
];

export function weeksForSeasonType(seasonType: SeasonType) {
  if (seasonType === 1) return PRESEASON_WEEKS;
  if (seasonType === 2) return REGULAR_SEASON_WEEKS;
  return Array.from({ length: 4 }, (_, index) => ({
    week: index + 1,
    label: `Playoff Week ${index + 1}`,
  }));
}

export function seasonTypeLabel(seasonType: SeasonType): string {
  return SEASON_TYPES.find((entry) => entry.value === seasonType)?.label ?? "Season";
}

export function weekLabelFor(seasonType: SeasonType, week: number): string {
  if (seasonType === 1) {
    return PRESEASON_WEEKS.find((entry) => entry.week === week)?.label ?? `Preseason Week ${week}`;
  }
  if (seasonType === 3) return `Playoffs ${week}`;
  return `Week ${week}`;
}

export async function fetchScoreboard(options?: {
  week?: number;
  seasonType?: SeasonType;
  season?: number;
}): Promise<ScoreboardMeta> {
  const params = new URLSearchParams();

  if (options?.seasonType) params.set("seasontype", String(options.seasonType));
  if (options?.week) params.set("week", String(options.week));
  if (options?.season) params.set("dates", String(options.season));
  else if (options?.week) params.set("dates", String(new Date().getFullYear()));

  const query = params.toString();
  const response = await fetch(query ? `${ESPN_BASE}?${query}` : ESPN_BASE);
  if (!response.ok) {
    throw new Error(`ESPN scoreboard failed (${response.status})`);
  }

  const data = (await response.json()) as EspnScoreboard;
  const season = data.season?.year ?? options?.season ?? new Date().getFullYear();
  const resolvedType = (data.season?.type ?? options?.seasonType ?? 2) as SeasonType;
  const resolvedWeek = options?.week ?? data.week?.number ?? 1;

  return {
    week: resolvedWeek,
    season,
    seasonType: resolvedType,
    weekLabel: weekLabelFor(resolvedType, resolvedWeek),
    games: (data.events ?? []).map((event) =>
      mapEvent(event, resolvedWeek, season, resolvedType)
    ),
  };
}

/** ESPN's default scoreboard = the NFL week happening now. */
export function fetchCurrentScoreboard(): Promise<ScoreboardMeta> {
  return fetchScoreboard();
}

function mapStatus(event: EspnEvent): Game["status"] {
  const state = event.status.type.state?.toLowerCase();
  const name = event.status.type.name?.toLowerCase() ?? "";
  const detail = `${event.status.type.detail ?? ""} ${event.status.type.shortDetail ?? ""}`.toLowerCase();
  if (event.status.type.completed || state === "post") return "final";
  if (state === "in" || name.includes("progress") || detail.includes("quarter") || detail.includes("half")) {
    return "in_progress";
  }
  if (name.includes("postpon")) return "postponed";
  return "scheduled";
}

function clockLabelFor(event: EspnEvent): string {
  const short = event.status.type.shortDetail?.trim();
  const clock = event.status.displayClock?.trim();
  const period = event.status.period;
  const blob = `${short ?? ""} ${event.status.type.detail ?? ""} ${event.status.type.description ?? ""}`.toLowerCase();

  if (event.status.type.completed || event.status.type.state?.toLowerCase() === "post") {
    return "Final";
  }
  if (blob.includes("half")) {
    return short && /half/i.test(short) ? short : "Halftime";
  }
  if (short && /q\d|ot/i.test(short)) return short;
  if (period && clock) {
    const quarter =
      period > 4 ? (period === 5 ? "OT" : `OT${period - 4}`) : `Q${period}`;
    return `${quarter} ${clock}`;
  }
  if (short) return short;
  return event.status.type.description ?? event.status.type.name ?? "Scheduled";
}

function mapEvent(
  event: EspnEvent,
  week: number,
  season: number,
  seasonType: SeasonType
): Game {
  const competition = event.competitions[0];
  const home = competition.competitors.find((c) => c.homeAway === "home");
  const away = competition.competitors.find((c) => c.homeAway === "away");
  if (!home || !away) throw new Error(`Incomplete ESPN event ${event.id}`);

  return {
    gameId: event.id,
    week,
    season,
    seasonType,
    gameDate: event.date,
    status: mapStatus(event),
    statusText: event.status.type.description ?? event.status.type.name ?? "Scheduled",
    clockLabel: clockLabelFor(event),
    homeTeam: {
      teamId: home.team.id,
      name: home.team.displayName ?? home.team.name,
      abbreviation: home.team.abbreviation,
      score: home.score !== undefined ? Number(home.score) : undefined,
      logo: home.team.logo,
    },
    awayTeam: {
      teamId: away.team.id,
      name: away.team.displayName ?? away.team.name,
      abbreviation: away.team.abbreviation,
      score: away.score !== undefined ? Number(away.score) : undefined,
      logo: away.team.logo,
    },
  };
}

export function isGameLocked(gameDate: string): boolean {
  return Date.now() >= new Date(gameDate).getTime();
}

export function gameWinner(game: Game): string | null {
  if (game.status !== "final") return null;

  const homeScore = game.homeTeam.score;
  const awayScore = game.awayTeam.score;
  if (homeScore === undefined || awayScore === undefined) return null;
  if (homeScore === awayScore) return null;

  return homeScore > awayScore
    ? game.homeTeam.abbreviation
    : game.awayTeam.abbreviation;
}

export type PickLiveStatus =
  | "pending"
  | "winning"
  | "losing"
  | "won"
  | "lost"
  | "push";

export function pickLiveStatus(game: Game, abbr: string): PickLiveStatus {
  if (game.status === "scheduled" || game.status === "postponed") {
    return "pending";
  }

  const homeScore = game.homeTeam.score;
  const awayScore = game.awayTeam.score;
  if (homeScore === undefined || awayScore === undefined) return "pending";

  const leading =
    homeScore === awayScore
      ? null
      : homeScore > awayScore
        ? game.homeTeam.abbreviation
        : game.awayTeam.abbreviation;

  if (game.status === "final") {
    if (!leading) return "push";
    return leading === abbr ? "won" : "lost";
  }

  if (!leading) return "pending";
  return leading === abbr ? "winning" : "losing";
}
