import { useEffect, useMemo, useState } from "react";
import TicketCard from "./components/TicketCard";
import {
  isGameLocked,
  seasonTypeLabel,
  SEASON_TYPES,
  weeksForSeasonType,
  type SeasonType,
} from "./lib/espn";
import {
  loadWeekPicks,
  pickKey,
  upsertPick,
  type PickMap,
} from "./lib/picksApi";
import { useNflSlate } from "./lib/useNflSlate";

type Props = {
  userLabel: string;
  timeZone: string;
  onSignOut: () => void;
};

export default function App({ userLabel, timeZone, onSignOut }: Props) {
  const {
    week,
    season,
    seasonType,
    weekLabel,
    games,
    loading,
    error,
    ready,
    selectWeek,
    selectSeasonType,
  } = useNflSlate();
  /** Working slate — not saved until Lock in */
  const [draft, setDraft] = useState<PickMap>({});
  /** Last locked-in picks from storage */
  const [submitted, setSubmitted] = useState<PickMap>({});
  const [pickIds, setPickIds] = useState<Record<string, string>>({});
  const [picksLoading, setPicksLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [picksError, setPicksError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    async function syncPicks() {
      setPicksLoading(true);
      setPicksError(null);
      setStatusMessage(null);
      try {
        const { map, ids } = await loadWeekPicks(season, week, seasonType);
        if (cancelled) return;
        setSubmitted(map);
        setDraft(map);
        setPickIds(ids);
      } catch (err) {
        if (!cancelled) {
          setPicksError(
            err instanceof Error ? err.message : "Could not load picks"
          );
        }
      } finally {
        if (!cancelled) setPicksLoading(false);
      }
    }

    void syncPicks();
    return () => {
      cancelled = true;
    };
  }, [season, week, seasonType, ready]);

  const available = useMemo(
    () => games.filter((game) => !isGameLocked(game.gameDate)),
    [games]
  );
  const locked = useMemo(
    () => games.filter((game) => isGameLocked(game.gameDate)),
    [games]
  );

  const editable = useMemo(
    () =>
      available.filter(
        (game) => !submitted[pickKey(season, week, game.gameId, seasonType)]
      ),
    [available, submitted, season, week, seasonType]
  );

  const draftEditableCount = editable.filter(
    (game) => draft[pickKey(season, week, game.gameId, seasonType)]
  ).length;

  const allEditablePicked =
    editable.length > 0 &&
    editable.every((game) => draft[pickKey(season, week, game.gameId, seasonType)]);

  const slateLockedIn = available.length > 0 && editable.length === 0;
  const canLockIn = allEditablePicked && !submitting;

  function handlePick(gameId: string, abbr: string) {
    const key = pickKey(season, week, gameId, seasonType);
    if (submitted[key]) return;
    setDraft((current) => ({ ...current, [key]: abbr }));
    setStatusMessage(null);
  }

  async function handleLockIn() {
    if (!canLockIn) return;
    setSubmitting(true);
    setPicksError(null);
    setStatusMessage(null);

    try {
      const nextIds = { ...pickIds };
      const nextSubmitted = { ...submitted };

      for (const game of editable) {
        const key = pickKey(season, week, game.gameId, seasonType);
        const abbr = draft[key];
        if (!abbr) continue;

        const id = await upsertPick({
          season,
          week,
          gameId: game.gameId,
          abbr,
          seasonType,
          existingId: pickIds[key],
        });
        nextIds[key] = id;
        nextSubmitted[key] = abbr;
      }

      setPickIds(nextIds);
      setSubmitted(nextSubmitted);
      setDraft((current) => ({ ...current, ...nextSubmitted }));
      setStatusMessage(
        `Locked in — ${Object.keys(nextSubmitted).filter((k) =>
          available.some(
            (g) => pickKey(season, week, g.gameId, seasonType) === k
          )
        ).length} picks are final for ${weekLabel}.`
      );
    } catch (err) {
      setPicksError(err instanceof Error ? err.message : "Could not lock in picks");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="board">
      <div className="board__glow" aria-hidden="true" />

      <header className="mast">
        <div className="mast__top">
          <p className="mast__league">Family Pool · {seasonTypeLabel(seasonType)}</p>
          <button type="button" className="sign-out" onClick={onSignOut}>
            Sign out
          </button>
        </div>
        <h1>{weekLabel}</h1>
        <p className="mast__sub">
          Roth House Picks · {userLabel}
        </p>
      </header>

      <div className="controls">
        <label className="week-rail">
          <span>Stage</span>
          <select
            value={seasonType}
            onChange={(event) =>
              selectSeasonType(Number(event.target.value) as SeasonType)
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
            onChange={(event) => selectWeek(Number(event.target.value))}
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
            ? "Syncing ESPN…"
            : error
              ? error
              : picksLoading
                ? "Loading your picks…"
                : slateLockedIn
                  ? "Slate locked in"
                  : `${draftEditableCount}/${editable.length} ready to lock`}
        </p>
      </div>

      {picksError ? <p className="banner banner--warn">{picksError}</p> : null}
      {statusMessage ? <p className="banner banner--ok">{statusMessage}</p> : null}

      {!loading && !error ? (
        <>
          <section className="lane">
            <h2>Open window</h2>
            <div className="lane__stack">
              {available.length === 0 ? (
                <p className="empty">No open games this slate.</p>
              ) : (
                available.map((game, index) => {
                  const key = pickKey(season, week, game.gameId, seasonType);
                  const isSubmitted = Boolean(submitted[key]);
                  return (
                    <div key={game.gameId} style={{ animationDelay: `${index * 40}ms` }}>
                      <TicketCard
                        game={game}
                        selectedAbbr={draft[key] ?? submitted[key]}
                        locked={isSubmitted}
                        lockedIn={isSubmitted}
                        timeZone={timeZone}
                        onPick={isSubmitted ? undefined : handlePick}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {editable.length > 0 ? (
            <div className="lock-bar">
              <p className="lock-bar__hint">
                {allEditablePicked
                  ? "Lock in now — picks cannot be changed after submit."
                  : "Pick every open game, then lock them in. No changes after."}
              </p>
              <button
                type="button"
                className="lock-bar__btn"
                disabled={!canLockIn}
                onClick={() => void handleLockIn()}
              >
                {submitting
                  ? "Locking in…"
                  : `Lock in picks (${draftEditableCount}/${editable.length})`}
              </button>
            </div>
          ) : slateLockedIn ? (
            <p className="banner banner--ok">
              This slate is locked in. No further changes.
            </p>
          ) : null}

          {locked.length > 0 ? (
            <section className="lane lane--locked">
              <h2>Locked / live</h2>
              <div className="lane__stack">
                {locked.map((game) => {
                  const key = pickKey(season, week, game.gameId, seasonType);
                  return (
                    <TicketCard
                      key={game.gameId}
                      game={game}
                      selectedAbbr={submitted[key] ?? draft[key]}
                      locked
                      lockedIn={Boolean(submitted[key])}
                      timeZone={timeZone}
                    />
                  );
                })}
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      <footer className="board__foot">
        Once locked in, picks are final. Kickoff also locks any unsubmitted games.
      </footer>
    </div>
  );
}
