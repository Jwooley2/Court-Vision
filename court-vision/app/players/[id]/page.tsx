import Link from "next/link";
import { supabase } from "@/lib/supabase";

function formatStat(value: number | string | null | undefined, decimals = 1) {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(decimals);
}

function formatPercent(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${(Number(value) * 100).toFixed(1)}%`;
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single();

  const { data: careerStats, error: careerStatsError } = await supabase
    .from("player_career_stats")
    .select("*")
    .eq("player_id", id)
    .maybeSingle();

  if (playerError || !player) {
    return (
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <Link href="/players">← Back to Players</Link>
        <h1>Player Not Found</h1>
        <p>We could not find this player.</p>
      </main>
    );
  }

  if (careerStatsError) {
    return (
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <Link href="/players">← Back to Players</Link>
        <h1>{player.name}</h1>
        <p>Error loading career stats: {careerStatsError.message}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <Link href="/players">← Back to Players</Link>

      <h1 style={{ fontSize: "3rem", marginTop: "1rem" }}>
        {player.name}
      </h1>

      <p style={{ color: "#bbb", marginBottom: "2rem" }}>
        {player.position} • {player.era}
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Career Stats</h2>

        <p>Games Played: {careerStats?.games_played ?? "—"}</p>
        <p>Seasons Played: {careerStats?.seasons_played ?? "—"}</p>

        <p>PPG: {formatStat(careerStats?.career_ppg)}</p>
        <p>RPG: {formatStat(careerStats?.career_rpg)}</p>
        <p>APG: {formatStat(careerStats?.career_apg)}</p>
        <p>SPG: {formatStat(careerStats?.career_spg)}</p>
        <p>BPG: {formatStat(careerStats?.career_bpg)}</p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Efficiency</h2>

        <p>FG%: {formatPercent(careerStats?.career_fg_pct)}</p>
        <p>3PT%: {formatPercent(careerStats?.career_3p_pct)}</p>
        <p>FT%: {formatPercent(careerStats?.career_ft_pct)}</p>
        <p>TS%: {formatPercent(careerStats?.career_ts_pct)}</p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Advanced Stats</h2>

        <p>PER: {formatStat(careerStats?.career_per, 2)}</p>
        <p>Win Shares: {formatStat(careerStats?.career_ws, 2)}</p>
        <p>BPM: {formatStat(careerStats?.career_bpm, 2)}</p>
        <p>VORP: {formatStat(careerStats?.career_vorp, 2)}</p>
      </section>

      <section>
        <h2>Accolades</h2>

        <p>Championships: {player.championships}</p>
        <p>MVPs: {player.mvps}</p>
        <p>Hall of Fame: {player.hall_of_fame ? "Yes" : "No"}</p>
      </section>
    </main>
  );
}