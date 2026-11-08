import type { CareerSummary } from "../app/players/[id]/CareerStatsPanel";

export type StoredPlayoffCareer = {
  games_played: number | null;
  postseasons_played: number | null;
  points_total: number | null;
  rebounds_total: number | null;
  assists_total: number | null;
  steals_total: number | null;
  blocks_total: number | null;
  field_goals_made: number | null;
  field_goals_attempted: number | null;
  source_cutoff: string;
  verification_status: string;
};

export function summarizeStoredPlayoffCareer(row: StoredPlayoffCareer | null): {
  summary: CareerSummary | null;
  games: number;
  seasons: number;
  provisional: boolean;
  sourceCutoff?: string;
} {
  if (!row) return { summary: null, games: 0, seasons: 0, provisional: true };
  const games = Number(row.games_played);
  if (!Number.isInteger(games) || games <= 0) {
    return { summary: null, games: 0, seasons: 0, provisional: true };
  }
  const perGame = (key: keyof Pick<StoredPlayoffCareer,
    "points_total" | "rebounds_total" | "assists_total" | "steals_total" | "blocks_total">) => {
    const total = row[key];
    return total === null || !Number.isFinite(Number(total)) || Number(total) < 0
      ? null : Number(total) / games;
  };
  const made = row.field_goals_made;
  const attempted = row.field_goals_attempted;
  const fg = made === null || attempted === null || Number(attempted) <= 0 ||
    Number(made) < 0 || Number(made) > Number(attempted)
    ? null : Number(made) / Number(attempted);
  return {
    summary: {
      career_ppg: perGame("points_total"),
      career_rpg: perGame("rebounds_total"),
      career_apg: perGame("assists_total"),
      career_spg: perGame("steals_total"),
      career_bpg: perGame("blocks_total"),
      career_fg_pct: fg,
    },
    games,
    seasons: Number(row.postseasons_played) || 0,
    provisional: row.verification_status !== "cross_checked",
    sourceCutoff: row.source_cutoff,
  };
}
