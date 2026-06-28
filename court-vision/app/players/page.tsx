import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  let query = supabase.from("players").select("*").order("name");

  if (search) {
    query = query.ilike("name", `%${search}%`);
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

      <form action="/players" style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          name="search"
          placeholder="Search players..."
          defaultValue={search || ""}
          style={{
            padding: "0.75rem",
            width: "100%",
            maxWidth: "400px",
            borderRadius: "8px",
            border: "1px solid #444",
            marginRight: "0.5rem",
          }}
        />

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

        {search && (
          <Link
            href="/players"
            style={{
              marginLeft: "1rem",
              color: "inherit",
            }}
          >
            Clear
          </Link>
        )}
      </form>

      <p style={{ marginBottom: "1rem", color: "#bbb" }}>
        Showing {players?.length || 0} player{players?.length === 1 ? "" : "s"}
        {search ? ` for "${search}"` : ""}
      </p>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        {players?.map((player) => (
          <Link
            key={player.id}
            href={`/players/${player.id}`}
            style={{
              border: "1px solid #444",
              borderRadius: "12px",
              padding: "1rem",
              textDecoration: "none",
              color: "inherit",
              background: "#111",
            }}
          >
            <h2 style={{ marginBottom: "0.25rem" }}>{player.name}</h2>

            <p style={{ marginBottom: "1rem", color: "#bbb" }}>
              {player.position} • {player.era}
            </p>

            <p>
              {player.career_ppg} PPG / {player.career_rpg} RPG /{" "}
              {player.career_apg} APG
            </p>

            <p>
              {player.championships} Championships • {player.mvps} MVPs
            </p>

            <p>Hall of Fame: {player.hall_of_fame ? "Yes" : "No"}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}