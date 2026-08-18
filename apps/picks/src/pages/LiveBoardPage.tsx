import { useEffect, useMemo, useState } from "react";
import {
  fetchCurrentScoreboard,
  fetchScoreboard,
  pickLiveStatus,
  seasonTypeLabel,
  SEASON_TYPES,
  weekLabelFor,
  weeksForSeasonType,
  type Game,
  type PickLiveStatus,
  type SeasonType,
} from "../lib/espn";
import { listWeekCloudPicks, type CloudPick } from "../lib/picksApi";
import { formatKickoff } from "../lib/timezone";

type Props = {
  userLabel: string;
  timeZone: string;
  onSignOut: () => void;
};

const LIVE_POLL_MS = 45_000;

export default function LiveBoardPage({ userLabel, timeZone, onSignOut }: Props) {
  const [week, setWeek] = useState(1);
  const [season, setSeason] = useState(new Date().getFullYear());
  const [seasonType, setSeasonType] = useState<SeasonType>(2);
  const [weekLabel, setWeekLabel] = useState("Week 1");
  const [games, setGames] = useState<Game[]>([]);
  const [picks, setPicks] = useState<CloudPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load(requestedWeek?: number, quiet = false) {
      if (!quiet) {
        setLoading(true);
        setError(null);
      }

      try {
        const board = bootstrapped
          ? await fetchScoreboard({
              week: requestedWeek,
              seasonType,
              season,
            })
          : await fetchCurrentScoreboard();
        const familyPicks = await listWeekCloudPicks(
          board.season,
          requestedWeek ?? board.week,
          board.seasonType
        );
        if (cancelled) return;
        setGames(board.games);
        setSeason(board.season);
        setSeasonType(board.seasonType);
        setWeekLabel(board.weekLabel);
        setPicks(familyPicks);
        if (!bootstrapped) {
          setWeek(board.week);
          setBootstrapped(true);
        }
      } catch (err) {
        if (!cancelled && !quiet) {
          setError(err instanceof Error ? err.message : "Could not load live board");
        }
      } finally {
        if (!cancelled && !quiet) setLoading(false);
      }
    }

    void load(bootstrapped ? week : undefined);
    return () => {
      cancelled = true;
    };
  }, [week, season, seasonType, bootstrapped]);

  const hasLiveGames = games.some((game) => game.status === "in_progress");

  useEffect(() => {
    if (!bootstrapped || !hasLiveGames) return;
    const timer = window.setInterval(() => {
      void fetchScoreboard({ week, seasonType, season }).then((board) => {
        setGames(board.games);
        setWeekLabel(board.weekLabel);
      });
    }, LIVE_POLL_MS);
    return () => window.clearInterval(timer);
  }, [bootstrapped, hasLiveGames, week, season, seasonType]);

  const rows = useMemo(
    () =>
      games.map((game) => ({
        game,
        visible: picks.filter((pick) => pick.gameId === game.gameId),
      })),
    [games, picks]
  );

  function handleSeasonTypeChange(nextType: SeasonType) {
    setSeasonType(nextType);
    setWeek(1);
    setWeekLabel(weekLabelFor(nextType, 1));
    setBootstrapped(false);
  }

  return (
    <div className="board">
      <div className="board__glow" aria-hidden="true" />

      <header className="mast">
        <div className="mast__top">
          <p className="mast__league">Family Pool · Live board</p>
          <button type="button" className="sign-out" onClick={onSignOut}>
            Sign out
          </button>
        </div>
        <h1>Who picked</h1>
        <p className="mast__sub">
          {weekLabel} · {userLabel}
        </p>
      </header>

      <div className="controls">
        <label className="week-rail">
          <span>Stage</span>
          <select
            value={seasonType}
            onChange={(event) =>
              handleSeasonTypeChange(Number(event.target.value) as SeasonType)
            }
          >
            {SEASON_TYPES.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>

        <label className="week-rail">
          <span>Jump slate</span>
          <select
            value={week}
            onChange={(event) => {
              setWeek(Number(event.target.value));
              setWeekLabel(weekLabelFor(seasonType, Number(event.target.value)));
            }}
          >
            {weeksForSeasonType(seasonType).map((entry) => (
              <option key={entry.week} value={entry.week}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
        <p className="controls__count">
          {loading
            ? "Loading board…"
            : error
              ? error
              : hasLiveGames
                ? `Live · ${seasonTypeLabel(seasonType)}`
                : `${picks.length} locked picks`}
        </p>
      </div>

      {!loading && !error ? (
        <div className="live-stack">
          {rows.length === 0 ? (
            <p className="empty">No games on this slate.</p>
          ) : (
            rows.map(({ game, visible }) => (
              <article key={game.gameId} className="live-card">
                <header className="live-card__head">
                  <p className="live-card__status">
                    {game.status === "scheduled"
                      ? formatKickoff(game.gameDate, timeZone)
                      : game.clockLabel}
                  </p>
                  <p className="live-card__score">
                    {game.awayTeam.abbreviation}{" "}
                    <strong>{scoreOrDash(game.awayTeam.score, game)}</strong>
                    <span>@</span>
                    {game.homeTeam.abbreviation}{" "}
                    <strong>{scoreOrDash(game.homeTeam.score, game)}</strong>
                  </p>
                </header>

                {visible.length === 0 ? (
                  <p className="live-card__empty">
                    No family picks locked for this game yet.
                  </p>
                ) : (
                  <ul className="live-picks">
                    {visible
                      .slice()
                      .sort((left, right) =>
                        left.pickerName.localeCompare(right.pickerName)
                      )
                      .map((pick) => {
                        const status = pickLiveStatus(game, pick.pickedTeamAbbr);
                        const yours =
                          pick.pickerName.toLowerCase() === userLabel.toLowerCase();
                        return (
                          <li
                            key={pick.id}
                            className={`live-pick is-${status}${yours ? " is-you" : ""}`}
                          >
                            <span className="live-pick__name">{pick.pickerName}</span>
                            <span className="live-pick__team">{pick.pickedTeamAbbr}</span>
                            <span className="live-pick__status">{statusLabel(status)}</span>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </article>
            ))
          )}
        </div>
      ) : null}

      <footer className="board__foot">
        Everyone’s locked pick is visible. Green is winning, red is losing.
        Scores, quarter, and time remaining refresh while games are live.
      </footer>
    </div>
  );
}

function scoreOrDash(score: number | undefined, game: Game) {
  if (game.status === "scheduled" || game.status === "postponed") return "–";
  return typeof score === "number" ? score : "–";
}

function statusLabel(status: PickLiveStatus) {
  if (status === "winning") return "Winning";
  if (status === "losing") return "Losing";
  if (status === "won") return "Won";
  if (status === "lost") return "Lost";
  if (status === "push") return "Tie";
  return "Pending";
}
