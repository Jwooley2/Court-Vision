"use client";

import { useState } from "react";

type Stat = number | string | null | undefined;

export type CareerSummary = {
  career_ppg?: Stat; career_rpg?: Stat; career_apg?: Stat;
  career_spg?: Stat; career_bpg?: Stat; career_fg_pct?: Stat;
};

export type ComparePlayer = {
  id: number;
  name: string;
  player_career_stats?: CareerSummary[] | CareerSummary | null;
};

const metrics: { label: string; key: keyof CareerSummary; pct?: boolean }[] = [
  { label: "PPG", key: "career_ppg" },
  { label: "RPG", key: "career_rpg" },
  { label: "APG", key: "career_apg" },
  { label: "SPG", key: "career_spg" },
  { label: "BPG", key: "career_bpg" },
  { label: "FG%", key: "career_fg_pct", pct: true },
];

function format(value: Stat, pct = false) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return pct ? `${(number * 100).toFixed(1)}%` : number.toFixed(1);
}

function getCareer(player: ComparePlayer): CareerSummary | null {
  const career = player.player_career_stats;
  return Array.isArray(career) ? (career[0] ?? null) : (career ?? null);
}

export default function CareerStatsPanel({
  playerId, playerName, regular, playoffs, playoffShooting, players,
}: {
  playerId: number;
  playerName: string;
  regular: CareerSummary | null;
  playoffs: { summary: CareerSummary | null; games: number; seasons: number; provisional: boolean };
  playoffShooting?: { percentage: number; fgm: number; fga: number; primaryUrl: string; crossCheckUrl: string; asOf: string } | null;
  players: ComparePlayer[];
}) {
  const [mode, setMode] = useState<"regular" | "playoffs" | "compare">("regular");
  const [opponentId, setOpponentId] = useState("");
  const opponent = players.find(player => String(player.id) === opponentId);
  const opponentCareer = opponent && getCareer(opponent);
  return (
    <section style={{ marginBottom: "2rem" }} aria-label="Career statistics">
      <h2>Career Averages</h2>
      <div role="group" aria-label="Statistics view"
        style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {([
          ["regular", "Regular Season"],
          ["playoffs", "Playoffs"],
          ["compare", "Compare"],
        ] as const).map(([key, label]) => (
          <button key={key} type="button" aria-pressed={mode === key}
            onClick={() => setMode(key)}
            style={{
              border: "1px solid #666", borderRadius: 8, padding: "0.6rem 0.9rem",
              background: mode === key ? "#333" : "transparent",
              color: "inherit", cursor: "pointer",
            }}>{label}</button>
        ))}
      </div>
      {mode === "playoffs" ? (
        <div>
          {!playoffs.summary ? (
            <p role="status">Playoff career statistics have not been recorded for this player yet.</p>
          ) : (
            <>
              <p>{playoffs.games} playoff games across {playoffs.seasons} postseasons.
                {playoffs.provisional ? " Season records are pending independent cross-check." : ""}
              </p>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                gap: "1rem",
              }}>
                {metrics.map(metric => (
                  <div key={metric.key}>
                    <strong style={{ fontSize: "1.65rem" }}>
                      {format(playoffs.summary?.[metric.key], metric.pct)}
                    </strong>
                    <div style={{ color: "#999" }}>{metric.label}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "0.875rem", color: "#999" }}>
                Career playoff averages are based on career playoff totals or reconciled
                historical playoff game records. {playoffs.summary?.career_fg_pct != null
                  ? "FG% is calculated from verified career playoff field goals made and attempted."
                  : "FG% is unavailable until career playoff makes and attempts are verified."}
                {" "}Regular-season shooting figures are never substituted.
              </p>
              {playoffShooting && (
                <p style={{ fontSize: "0.875rem", color: "#999" }}>
                  Playoff shooting: {playoffShooting.fgm.toLocaleString()} / {playoffShooting.fga.toLocaleString()} FGM/FGA.
                  {" "}Sources: <a href={playoffShooting.primaryUrl} target="_blank" rel="noreferrer">NBA</a>
                  {" "}and <a href={playoffShooting.crossCheckUrl} target="_blank" rel="noreferrer">UNC record book</a>.
                </p>
              )}
            </>
          )}
        </div>
      ) : mode === "compare" ? (
        <div>
          <label htmlFor="comparison-opponent">Compare {playerName} with </label>
          <select id="comparison-opponent" value={opponentId}
            onChange={event => setOpponentId(event.target.value)}
            style={{ padding: "0.5rem", margin: "0.5rem 0 1rem", maxWidth: "100%" }}>
            <option value="">Select a player</option>
            {players.filter(player => player.id !== playerId).map(player =>
              <option key={player.id} value={player.id}>{player.name}</option>)}
          </select>
          {opponent && (
            <>
              <p>Regular-season career averages — unavailable data is shown as —.</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr><th scope="col">Metric</th><th scope="col">{playerName}</th>
                    <th scope="col">{opponent.name}</th></tr></thead>
                  <tbody>{metrics.map(metric => (
                    <tr key={metric.key}>
                      <th scope="row" style={{ padding: "0.6rem", textAlign: "left" }}>{metric.label}</th>
                      <td style={{ textAlign: "center" }}>{format(regular?.[metric.key], metric.pct)}</td>
                      <td style={{ textAlign: "center" }}>{format(opponentCareer?.[metric.key], metric.pct)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              {!opponentCareer && <p role="status">The selected player&apos;s career summary is incomplete.</p>}
            </>
          )}
          {!opponent && <p>Select another player to see the available shared career averages.</p>}
          <p style={{ fontSize: "0.875rem", color: "#999" }}>
            No winner or weighted score is inferred. Cross-era coverage may differ.
          </p>
        </div>
      ) : (
        <div>
          {!regular && <p role="status">Regular-season career summary is unavailable.</p>}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: "1rem",
          }}>
            {metrics.map(metric => (
              <div key={metric.key}>
                <strong style={{ fontSize: "1.65rem" }}>
                  {format(regular?.[metric.key], metric.pct)}
                </strong>
                <div style={{ color: "#999" }}>{metric.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.875rem", color: "#999" }}>
            Available NBA regular-season career summary. Active players may have games after the recorded data cutoff.
          </p>
        </div>
      )}
    </section>
  );
}
