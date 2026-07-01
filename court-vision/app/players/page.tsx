import Link from "next/link";
import { supabase } from "@/lib/supabase";

function formatStat(value: number | string | null | undefined, decimals = 1) {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(decimals);
}

type CareerStats = {
  career_ppg: number | string | null;
  career_rpg: number | string | null;
  career_apg: number | string | null;
};

type PlayerWithCareerStats = {
  id: number;
  name: string;
  position: string | null;
  era: string | null;
  championships: number | null;
  mvps: number | null;
  hall_of_fame: boolean | null;
  player_career_stats?: CareerStats[] | CareerStats | null;
};

function getCareerStats(player: PlayerWithCareerStats) {
  const stats = player.player_career_stats;

  if (Array.isArray(stats)) {
    return stats[0];
  }

  return stats;
}

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    position?: string;
    era?: string;
  }>;
}) {
  const { search, position, era } = await searchParams;

  let query = supabase
    .from("players")
    .select(
      `
        id,
        name,
        position,
        era,
        championships,
        mvps,
        hall_of_fame,
        player_career_stats (
          career_ppg,
          career_rpg,
          career_apg
        )
      `
    )
    .order("name");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (position) {
    query = query.eq("position", position);
  }

  if (era) {
    query = query.eq("era", era);
  }

  const { data: players, error } = await query;

  if (error) {
    return (
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <h1>Players</h1>
        <p>Error loading players: {error.message}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
        Players
      </h1>

      <p style={{ marginBottom: "2rem" }}>
        Search and explore the Court Vision player database.
      </p>

      <form
        action="/players"
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <input
          type="text"
          name="search"
          placeholder="Search players..."
          defaultValue={search || ""}
          style={{
            padding: "0.75rem",
            width: "300px",
            borderRadius: "8px",
            border: "1px solid #444",
          }}
        />

        <select
          name="position"
          defaultValue={position || ""}
          style={{
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid #444",
          }}
        >
          <option value="">All Positions</option>
          <option value="PG">Point Guard</option>
          <option value="SG">Shooting Guard</option>
          <option value="SF">Small Forward</option>
          <option value="PF">Power Forward</option>
          <option value="C">Center</option>
        </select>

        <select
          name="era"
          defaultValue={era || ""}
          style={{
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid #444",
          }}
        >
          <option value="">All Eras</option>
          <option value="1960s">1960s</option>
          <option value="1970s">1970s</option>
          <option value="1980s">1980s</option>
          <option value="1990s">1990s</option>
          <option value="2000s">2000s</option>
          <option value="2010s">2010s</option>
          <option value="2020s">2020s</option>
        </select>

        <button
          type="submit"
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            border: "1px solid #444",
            cursor: "pointer",
          }}
        >
          Search
        </button>

        {(search || position || era) && (
          <Link
            href="/players"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Clear
          </Link>
        )}
      </form>

      <p style={{ marginBottom: "1rem", color: "#bbb" }}>
        Showing {players?.length || 0} player
        {players?.length === 1 ? "" : "s"}
        {search ? ` for "${search}"` : ""}
        {position ? ` (${position})` : ""}
        {era ? ` in the ${era}` : ""}
      </p>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        {players?.map((player) => {
          const typedPlayer = player as PlayerWithCareerStats;
          const careerStats = getCareerStats(typedPlayer);

          return (
            <a
              key={typedPlayer.id}
              href={`/players/${typedPlayer.id}`}
              style={{
                display: "block",
                border: "1px solid #444",
                borderRadius: "12px",
                padding: "1rem",
                textDecoration: "none",
                color: "inherit",
                background: "#111",
                cursor: "pointer",
                position: "relative",
                zIndex: 1,
              }}
            >
              <h2 style={{ marginBottom: "0.25rem" }}>{typedPlayer.name}</h2>

              <p style={{ marginBottom: "1rem", color: "#bbb" }}>
                {typedPlayer.position} • {typedPlayer.era}
              </p>

              <p>
                {formatStat(careerStats?.career_ppg)} PPG /{" "}
                {formatStat(careerStats?.career_rpg)} RPG /{" "}
                {formatStat(careerStats?.career_apg)} APG
              </p>

              <p>
                {typedPlayer.championships} Championships • {typedPlayer.mvps} MVPs
              </p>

              <p>Hall of Fame: {typedPlayer.hall_of_fame ? "Yes" : "No"}</p>
            </a>
          );
        })}
      </div>
    </main>
  );
}