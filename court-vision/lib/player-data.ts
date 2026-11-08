import { withPlayerRead } from "./supabase";
import { summarizePlayoffSeasons, type PlayoffSeasonRow } from "./playoff-summary";
import { summarizeStoredPlayoffCareer, type StoredPlayoffCareer } from "./playoff-career";

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
    // Do not query the new table until the founder separately approves its migration.
    // Prefer one career-level read; retain legacy Jordan season fallback as needed.
    const storedPlayoffEnabled = process.env.COURT_VISION_PLAYOFF_SUMMARIES_ENABLED === "true";
    const [career, accolades, playoffRecord] = await Promise.all([
      client.from("player_career_stats").select("*").eq("player_id", id).maybeSingle().retry(false),
      client.from("player_accolades").select("*").eq("player_id", id)
        .order("season_year", { ascending: true, nullsFirst: false })
        .order("accolade_name", { ascending: true }).retry(false),
      storedPlayoffEnabled
        ? client.from("player_playoff_career_stats").select("*").eq("player_id", id).maybeSingle().retry(false)
        : Promise.resolve({ data: null, error: null }),
    ]);
    if (career.error || accolades.error || playoffRecord.error) {
      throw career.error || accolades.error || playoffRecord.error;
    }
    let playoffs = summarizeStoredPlayoffCareer(
      (playoffRecord.data ?? null) as StoredPlayoffCareer | null
    );
    if (!playoffs.summary) {
      // Historical fallback for Jordan and existing season-based profiles only.
      const fallback = await client.from("player_seasons")
        .select("season_year,stint_type,games_played,points_total,rebounds_total,assists_total,steals_total,blocks_total,verification_status")
        .eq("player_id", id).eq("league", "NBA").eq("season_type", "playoffs")
        .order("season_year", { ascending: true }).retry(false);
      if (fallback.error) throw fallback.error;
      playoffs = summarizePlayoffSeasons((fallback.data ?? []) as PlayoffSeasonRow[]);
    }
    return {
      player,
      careerStats: career.data,
      accolades: accolades.data ?? [],
      playoffs,
    };
  });
}
