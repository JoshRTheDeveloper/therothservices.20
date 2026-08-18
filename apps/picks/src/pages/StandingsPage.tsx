import { useEffect, useState } from "react";
import {
  seasonTypeLabel,
  SEASON_TYPES,
  type SeasonType,
} from "../lib/espn";
import { listSeasonPicks } from "../lib/picksApi";
import { buildStandings, type StandingsRow } from "../lib/standings";

type Props = {
  userLabel: string;
  onSignOut: () => void;
};

export default function StandingsPage({ userLabel, onSignOut }: Props) {
  const [season, setSeason] = useState(new Date().getFullYear());
  const [seasonType, setSeasonType] = useState<SeasonType>(2);
  const [rows, setRows] = useState<StandingsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const picks = await listSeasonPicks(season, seasonType);
        const standings = await buildStandings(picks, season, seasonType);
        if (!cancelled) setRows(standings);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load standings"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [season, seasonType]);

  return (
    <div className="board">
      <div className="board__glow" aria-hidden="true" />

      <header className="mast">
        <div className="mast__top">
          <p className="mast__league">Family Pool · Standings</p>
          <button type="button" className="sign-out" onClick={onSignOut}>
            Sign out
          </button>
        </div>
        <h1>Leaderboard</h1>
        <p className="mast__sub">
          Roth House Picks · {userLabel}
        </p>
      </header>

      <div className="controls">
        <label className="week-rail">
          <span>Season</span>
          <select
            value={season}
            onChange={(event) => setSeason(Number(event.target.value))}
          >
            {[season - 1, season, season + 1].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="week-rail">
          <span>Stage</span>
          <select
            value={seasonType}
            onChange={(event) =>
              setSeasonType(Number(event.target.value) as SeasonType)
            }
          >
            {SEASON_TYPES.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>

        <p className="controls__count">
          {loading
            ? "Crunching results…"
            : error
              ? error
              : `${rows.length} players · ${seasonTypeLabel(seasonType)} ${season}`}
        </p>
      </div>

      {!loading && !error ? (
        <section className="standings">
          {rows.length === 0 ? (
            <p className="empty">No locked picks yet for this slate.</p>
          ) : (
            <table className="standings__table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Player</th>
                  <th scope="col">W</th>
                  <th scope="col">L</th>
                  <th scope="col">Open</th>
                  <th scope="col">Win %</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.owner}
                    className={
                      row.pickerName.toLowerCase() === userLabel.toLowerCase()
                        ? "is-you"
                        : undefined
                    }
                  >
                    <td>{index + 1}</td>
                    <td>{row.pickerName}</td>
                    <td>{row.wins}</td>
                    <td>{row.losses}</td>
                    <td>{row.pending}</td>
                    <td>{Math.round(row.winPct * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : null}

      <footer className="board__foot">
        Straight-up winners only. Ties and unfinished games stay open.
      </footer>
    </div>
  );
}
