import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: players, error } = await supabase
    .from("players")
    .select("*");

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Court Vision</h1>

      <h2>Players</h2>

      {error && <p>Error loading players: {error.message}</p>}

      {players?.map((player) => (
        <div
          key={player.id}
          style={{
            border: "1px solid gray",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3>{player.name}</h3>

          <p>Position: {player.position}</p>
          <p>Era: {player.era}</p>

          <h4>Career Stats</h4>
          <p>PPG: {player.career_ppg}</p>
          <p>RPG: {player.career_rpg}</p>
          <p>APG: {player.career_apg}</p>
          <p>SPG: {player.career_spg}</p>
          <p>BPG: {player.career_bpg}</p>

          <h4>Accolades</h4>
          <p>Championships: {player.championships}</p>
          <p>MVPs: {player.mvps}</p>

          <h4>Career</h4>
          <p>Seasons Played: {player.seasons_played}</p>
          <p>Hall of Fame: {player.hall_of_fame ? "Yes" : "No"}</p>
        </div>
      ))}
    </main>
  );
}