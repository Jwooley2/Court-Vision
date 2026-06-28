import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !player) {
    return (
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <Link href="/players">← Back to Players</Link>
        <h1>Player Not Found</h1>
        <p>We could not find this player.</p>
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
        <p>PPG: {player.career_ppg}</p>
        <p>RPG: {player.career_rpg}</p>
        <p>APG: {player.career_apg}</p>
        <p>SPG: {player.career_spg}</p>
        <p>BPG: {player.career_bpg}</p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Accolades</h2>
        <p>Championships: {player.championships}</p>
        <p>MVPs: {player.mvps}</p>
        <p>Hall of Fame: {player.hall_of_fame ? "Yes" : "No"}</p>
      </section>

      <section>
        <h2>Career</h2>
        <p>Seasons Played: {player.seasons_played}</p>
      </section>
    </main>
  );
}