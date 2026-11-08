import type { CareerSummary } from "../app/players/[id]/CareerStatsPanel";

export type PlayoffSeasonRow = {
  season_year: number;
  stint_type: string;
  games_played: number | null;
  points_total: number | null;
  rebounds_total: number | null;
  assists_total: number | null;
  steals_total: number | null;
  blocks_total: number | null;
  verification_status?: string | null;
};

// Each season can have several team stints plus a combined TOTAL row.
// Prefer the combined row, otherwise sum team stints, never both.
export function summarizePlayoffSeasons(rows: PlayoffSeasonRow[]): {
  summary: CareerSummary | null;
  games: number;
  seasons: number;
  provisional: boolean;
} {
  const seasons = new Map<number, PlayoffSeasonRow[]>();
  for (const row of rows) {
    if (!Number.isInteger(row.season_year)) continue;
    const existing = seasons.get(row.season_year) ?? [];
    existing.push(row);
    seasons.set(row.season_year, existing);
  }
  const selected = [...seasons.values()].flatMap(group => {
    const totals = group.filter(row => row.stint_type === "total");
    return totals.length ? totals.slice(0, 1) : group.filter(row => row.stint_type === "team");
  });
  const games = selected.reduce((n, row) => n + (Number(row.games_played) || 0), 0);
  if (!selected.length || !games || selected.some(row =>
    row.games_played === null || !Number.isFinite(Number(row.games_played)) || Number(row.games_played) <= 0
  )) return { summary: null, games: 0, seasons: seasons.size, provisional: true };

  const avg = (column: keyof Pick<PlayoffSeasonRow, "points_total" | "rebounds_total" | "assists_total" | "steals_total" | "blocks_total">) => {
    if (selected.some(row => row[column] === null || row[column] === undefined ||
      !Number.isFinite(Number(row[column])) || Number(row[column]) < 0)) return null;
    return selected.reduce((n, row) => n + Number(row[column]), 0) / games;
  };

  return {
    summary: {
      career_ppg: avg("points_total"),
      career_rpg: avg("rebounds_total"),
      career_apg: avg("assists_total"),
      career_spg: avg("steals_total"),
      career_bpg: avg("blocks_total"),
      // Career FG% cannot be derived accurately from season FG% alone:
      // it requires total career field goals made / attempted.
      career_fg_pct: null,
    },
    games,
    seasons: seasons.size,
    provisional: selected.some(row => row.verification_status !== "cross_checked"),
  };
}
