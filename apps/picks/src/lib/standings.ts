import type { CloudPick } from "./picksApi";
import { fetchScoreboard, gameWinner, type Game, type SeasonType } from "./espn";

export type StandingsRow = {
  owner: string;
  pickerName: string;
  wins: number;
  losses: number;
  pending: number;
  winPct: number;
};

async function loadGamesForWeek(
  season: number,
  seasonType: SeasonType,
  week: number
): Promise<Game[]> {
  const board = await fetchScoreboard({ season, seasonType, week });
  return board.games;
}

export async function buildStandings(
  picks: CloudPick[],
  season: number,
  seasonType: SeasonType
): Promise<StandingsRow[]> {
  if (picks.length === 0) return [];

  const weeks = [...new Set(picks.map((pick) => pick.week))].sort((a, b) => a - b);
  const gamesById = new Map<string, Game>();

  await Promise.all(
    weeks.map(async (week) => {
      const games = await loadGamesForWeek(season, seasonType, week);
      for (const game of games) {
        gamesById.set(`${week}:${game.gameId}`, game);
      }
    })
  );

  const rows = new Map<string, StandingsRow>();

  for (const pick of picks) {
    const key = pick.owner;
    const row =
      rows.get(key) ??
      ({
        owner: pick.owner,
        pickerName: pick.pickerName,
        wins: 0,
        losses: 0,
        pending: 0,
        winPct: 0,
      } satisfies StandingsRow);

    row.pickerName = pick.pickerName;

    const game = gamesById.get(`${pick.week}:${pick.gameId}`);
    if (!game) {
      row.pending += 1;
      rows.set(key, row);
      continue;
    }

    const winner = gameWinner(game);
    if (!winner) {
      row.pending += 1;
    } else if (pick.pickedTeamAbbr === winner) {
      row.wins += 1;
    } else {
      row.losses += 1;
    }

    rows.set(key, row);
  }

  return [...rows.values()]
    .map((row) => {
      const decided = row.wins + row.losses;
      return {
        ...row,
        winPct: decided > 0 ? row.wins / decided : 0,
      };
    })
    .sort((left, right) => {
      if (right.wins !== left.wins) return right.wins - left.wins;
      if (left.losses !== right.losses) return left.losses - right.losses;
      return left.pickerName.localeCompare(right.pickerName);
    });
}
