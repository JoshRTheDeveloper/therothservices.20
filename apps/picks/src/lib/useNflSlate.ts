import { useEffect, useRef, useState } from "react";
import {
  fetchCurrentScoreboard,
  fetchScoreboard,
  weekLabelFor,
  type Game,
  type ScoreboardMeta,
  type SeasonType,
} from "./espn";

export function useNflSlate() {
  const [week, setWeek] = useState(1);
  const [season, setSeason] = useState(new Date().getFullYear());
  const [seasonType, setSeasonType] = useState<SeasonType>(1);
  const [weekLabel, setWeekLabel] = useState("This week");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const userOverride = useRef(false);

  function applyBoard(board: ScoreboardMeta) {
    setGames(board.games);
    setSeason(board.season);
    setSeasonType(board.seasonType);
    setWeek(board.week);
    setWeekLabel(board.weekLabel);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadCurrent() {
      setLoading(true);
      setError(null);
      try {
        const board = await fetchCurrentScoreboard();
        if (cancelled || userOverride.current) return;
        applyBoard(board);
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load ESPN scoreboard"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCurrent();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !userOverride.current) return;
    let cancelled = false;

    async function loadSelected() {
      setLoading(true);
      setError(null);
      try {
        const board = await fetchScoreboard({ week, seasonType, season });
        if (cancelled) return;
        setGames(board.games);
        setWeekLabel(board.weekLabel);
        setSeason(board.season);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load ESPN scoreboard"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSelected();
    return () => {
      cancelled = true;
    };
  }, [ready, week, seasonType, season]);

  function selectWeek(nextWeek: number) {
    userOverride.current = true;
    setWeek(nextWeek);
    setWeekLabel(weekLabelFor(seasonType, nextWeek));
  }

  function selectSeasonType(nextType: SeasonType) {
    userOverride.current = true;
    setSeasonType(nextType);
    setWeek(1);
    setWeekLabel(weekLabelFor(nextType, 1));
  }

  return {
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
    setGames,
  };
}
