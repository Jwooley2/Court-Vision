import { withPlayerRead } from "./supabase";
import { summarizePlayoffSeasons, type PlayoffSeasonRow } from "./playoff-summary";

export type PlayerFilters = { search?: string; position?: string; era?: string };

export function readPlayers({ search, position, era }: PlayerFilters) {
  return withPlayerRead(async (client) => {
    let query = client.from("players").select(`
      id, name, position, era, championships, mvps, hall_of_fame,
      player_career_stats (career_ppg, career_rpg, career_apg, career_spg, career_bpg, career_fg_pct)
    `).order("name").retry(false);
    if (search) query = query.ilike("name", `%${search}%`);
    if (position) query = query.eq("position", position);
    if (era) query = query.eq("era", era);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  });
}

export function isPlayerId(id: string) {
  return /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id));
}

export async function readPlayerProfile(id: string) {
  if (!isPlayerId(id)) return null;
  return withPlayerRead(async (client) => {
    const { data: player, error } = await client.from("players")
      .select("*").eq("id", id).maybeSingle().retry(false);
    if (error) throw error;
    if (!player) return null;
    const [career, accolades, playoffRows] = await Promise.all([
      client.from("player_career_stats").select("*").eq("player_id", id).maybeSingle().retry(false),
      client.from("player_accolades").select("*").eq("player_id", id)
        .order("season_year", { ascending: true, nullsFirst: false })
        .order("accolade_name", { ascending: true }).retry(false),
      client.from("player_seasons")
        .select("season_year,stint_type,games_played,points_total,rebounds_total,assists_total,steals_total,blocks_total,verification_status")
        .eq("player_id", id).eq("league", "NBA").eq("season_type", "playoffs")
        .order("season_year", { ascending: true }).retry(false),
    ]);
    if (career.error || accolades.error || playoffRows.error) {
      throw career.error || accolades.error || playoffRows.error;
    }
    return {
      player,
      careerStats: career.data,
      accolades: accolades.data ?? [],
      playoffs: summarizePlayoffSeasons((playoffRows.data ?? []) as PlayoffSeasonRow[]),
    };
  });
}
