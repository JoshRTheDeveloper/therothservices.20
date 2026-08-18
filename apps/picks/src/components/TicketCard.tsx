import type { Game } from "../lib/espn";
import { formatKickoff } from "../lib/timezone";
import { shortTeamName, teamTone } from "../lib/teamTone";
import "./TicketCard.css";

type Props = {
  game: Game;
  selectedAbbr?: string;
  locked: boolean;
  /** Already submitted / locked-in for this game */
  lockedIn?: boolean;
  timeZone: string;
  onPick?: (gameId: string, abbr: string) => void;
};

export default function TicketCard({
  game,
  selectedAbbr,
  locked,
  lockedIn = false,
  timeZone,
  onPick,
}: Props) {
  const kickoff = formatKickoff(game.gameDate, timeZone);

  const stubLabel = game.status === "final"
    ? "FINAL"
    : locked
      ? "LOCKED"
      : lockedIn
        ? "IN"
        : "OPEN";

  const showScore =
    game.status === "in_progress" || game.status === "final";

  return (
    <article className={`ticket${locked ? " is-locked" : ""}${lockedIn && !locked ? " is-in" : ""}`}>
      <div className="ticket__stub" aria-hidden="true">
        <span>{stubLabel}</span>
      </div>

      <div className="ticket__body">
        <header className="ticket__meta">
          <time dateTime={game.gameDate}>{kickoff}</time>
          <span>{game.clockLabel}</span>
        </header>

        <div className="ticket__matchup">
          <TeamChoice
            team={game.awayTeam}
            selected={selectedAbbr === game.awayTeam.abbreviation}
            locked={locked}
            showScore={showScore}
            onClick={() => onPick?.(game.gameId, game.awayTeam.abbreviation)}
          />
          <span className="ticket__vs">AT</span>
          <TeamChoice
            team={game.homeTeam}
            selected={selectedAbbr === game.homeTeam.abbreviation}
            locked={locked}
            showScore={showScore}
            onClick={() => onPick?.(game.gameId, game.homeTeam.abbreviation)}
          />
        </div>
      </div>
    </article>
  );
}

function TeamChoice({
  team,
  selected,
  locked,
  showScore,
  onClick,
}: {
  team: Game["homeTeam"];
  selected: boolean;
  locked: boolean;
  showScore: boolean;
  onClick: () => void;
}) {
  const tone = teamTone(team.abbreviation);

  return (
    <button
      type="button"
      className={`choice${selected ? " is-selected" : ""}`}
      style={{ ["--tone" as string]: tone }}
      disabled={locked}
      onClick={onClick}
    >
      {team.logo ? <img src={team.logo} alt="" width={36} height={36} /> : null}
      <strong>{team.abbreviation}</strong>
      <span>{shortTeamName(team.name)}</span>
      {showScore && typeof team.score === "number" ? <em>{team.score}</em> : null}
    </button>
  );
}
