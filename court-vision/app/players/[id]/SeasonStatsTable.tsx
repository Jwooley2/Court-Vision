"use client";

import { useState } from "react";

function formatStat(value: number | string | null | undefined, decimals = 1) {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(decimals);
}

function formatPercent(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${(Number(value) * 100).toFixed(1)}%`;
}

type SeasonTeam = {
  name: string | null;
  abbreviation: string | null;
};

export type PlayerSeason = {
  id: number;
  season_label: string;
  season_year: number;
  age: number | null;
  teams?: SeasonTeam | SeasonTeam[] | null;

  games_played: number | null;
  games_started: number | null;
  minutes_per_game: number | string | null;

  points_per_game: number | string | null;
  rebounds_per_game: number | string | null;
  assists_per_game: number | string | null;
  steals_per_game: number | string | null;
  blocks_per_game: number | string | null;

  field_goal_pct: number | string | null;
  three_point_pct: number | string | null;
  free_throw_pct: number | string | null;

  points_total: number | null;
  rebounds_total: number | null;
  assists_total: number | null;

  player_efficiency_rating: number | string | null;
  true_shooting_pct: number | string | null;
  usage_pct: number | string | null;
  win_shares: number | string | null;
  win_shares_per_48: number | string | null;
  box_plus_minus: number | string | null;
  value_over_replacement_player: number | string | null;

  source_citation_required: boolean | null;
  primary_source_url: string | null;
};

function getSeasonTeamName(season: PlayerSeason) {
  const team = Array.isArray(season.teams) ? season.teams[0] : season.teams;

  if (!team) return "—";
  return team.abbreviation || team.name || "—";
}

export default function SeasonStatsTable({
  seasons,
}: {
  seasons: PlayerSeason[];
}) {
  const [activeSeasonView, setActiveSeasonView] = useState<"basic" | "advanced">(
    "basic"
  );

  const shouldShowSportsReferenceCitation = seasons.some(
    (season) => season.source_citation_required
  );

  const sportsReferenceUrl =
    seasons.find((season) => season.primary_source_url)?.primary_source_url ||
    "https://www.basketball-reference.com/";

  return (
    <section style={{ marginBottom: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>NBA Regular Seasons</h2>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setActiveSeasonView("basic")}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #444",
              color: "inherit",
              background: activeSeasonView === "basic" ? "#333" : "transparent",
              cursor: "pointer",
            }}
          >
            Basic
          </button>

          <button
            type="button"
            onClick={() => setActiveSeasonView("advanced")}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #444",
              color: "inherit",
              background:
                activeSeasonView === "advanced" ? "#333" : "transparent",
              cursor: "pointer",
            }}
          >
            Advanced
          </button>
        </div>
      </div>

      {seasons.length === 0 ? (
        <p>No regular-season stats found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: activeSeasonView === "advanced" ? "900px" : "1000px",
            }}
          >
            <thead>
              <tr>
                {(activeSeasonView === "advanced"
                  ? [
                      "Season",
                      "Age",
                      "Team",
                      "PER",
                      "TS%",
                      "USG%",
                      "WS",
                      "WS/48",
                      "BPM",
                      "VORP",
                    ]
                  : [
                      "Season",
                      "Age",
                      "Team",
                      "GP",
                      "GS",
                      "MPG",
                      "PPG",
                      "RPG",
                      "APG",
                      "SPG",
                      "BPG",
                      "FG%",
                      "3PT%",
                      "FT%",
                      "PTS",
                      "REB",
                      "AST",
                    ]
                ).map((header) => (
                  <th
                    key={header}
                    style={{
                      borderBottom: "1px solid #444",
                      padding: "0.5rem",
                      textAlign: "left",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {seasons.map((season) => (
                <tr key={season.id}>
                  <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                    {season.season_label}
                  </td>

                  <td style={{ padding: "0.5rem" }}>{season.age ?? "—"}</td>

                  <td style={{ padding: "0.5rem" }}>
                    {getSeasonTeamName(season)}
                  </td>

                  {activeSeasonView === "advanced" ? (
                    <>
                      <td style={{ padding: "0.5rem" }}>
                        {formatStat(season.player_efficiency_rating, 1)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatPercent(season.true_shooting_pct)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatStat(season.usage_pct, 1)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatStat(season.win_shares, 1)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatStat(season.win_shares_per_48, 3)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatStat(season.box_plus_minus, 1)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatStat(
                          season.value_over_replacement_player,
                          1
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: "0.5rem" }}>
                        {season.games_played ?? "—"}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {season.games_started ?? "—"}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatStat(season.minutes_per_game)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatStat(season.points_per_game)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatStat(season.rebounds_per_game)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatStat(season.assists_per_game)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatStat(season.steals_per_game)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatStat(season.blocks_per_game)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatPercent(season.field_goal_pct)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatPercent(season.three_point_pct)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {formatPercent(season.free_throw_pct)}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {season.points_total ?? "—"}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {season.rebounds_total ?? "—"}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {season.assists_total ?? "—"}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shouldShowSportsReferenceCitation && (
        <p style={{ marginTop: "0.75rem", color: "#bbb", fontSize: "0.9rem" }}>
          Advanced season data sourced from{" "}
          <a href={sportsReferenceUrl} target="_blank" rel="noreferrer">
            Sports Reference / Basketball Reference
          </a>
          .
        </p>
      )}
    </section>
  );
}