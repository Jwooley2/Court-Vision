import Link from "next/link";
import { readPlayers, readPlayerProfile } from "@/lib/player-data";
import ComparisonBoard, { type ComparisonPlayer } from "./ComparisonBoard";

type Query = { left?: string; right?: string };
type LoadedProfile = NonNullable<Awaited<ReturnType<typeof readPlayerProfile>>>;

function n(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function makeComparison(profile: LoadedProfile): ComparisonPlayer {
  const { player, careerStats, playoffs, accolades } = profile;
  const awards = (accolades ?? []) as { league: string; accolade_name: string }[];
  const count = (name: string, league = "NBA") =>
    awards.filter(award => award.league === league && award.accolade_name === name).length;
  return {
    id: Number(player.id), name: String(player.name), position: player.position ?? null,
    cutoff: player.external_id === "lebron_james" ? "2025–26" : "full retired career",
    career: {
      games: n(careerStats?.games_played),
      ppg: n(careerStats?.career_ppg), rpg: n(careerStats?.career_rpg),
      apg: n(careerStats?.career_apg), spg: n(careerStats?.career_spg),
      bpg: n(careerStats?.career_bpg), fg: n(careerStats?.career_fg_pct),
      three: n(careerStats?.career_3p_pct), ft: n(careerStats?.career_ft_pct),
      ts: n(careerStats?.career_ts_pct),
    },
    playoffs: {
      games: n(playoffs.games), appearances: n(playoffs.seasons),
      ppg: n(playoffs.summary?.career_ppg), rpg: n(playoffs.summary?.career_rpg),
      apg: n(playoffs.summary?.career_apg), spg: n(playoffs.summary?.career_spg),
      bpg: n(playoffs.summary?.career_bpg), fg: n(playoffs.summary?.career_fg_pct),
    },
    playoffGames: n(playoffs.games),
    honors: {
      championships: count("NBA Champion"),
      mvps: count("NBA MVP"),
      finalsMvps: count("NBA Finals MVP"),
      dpoy: count("NBA Defensive Player of the Year"),
      allNba: count("All-NBA"),
      allDefense: count("NBA All-Defensive Team"),
      allStars: count("NBA All-Star"),
      scoring: count("NBA Scoring Champion"),
      steals: count("NBA Steals Leader"),
      assists: count("NBA Assists Leader"),
      olympicGold: count("Olympic Gold Medal", "Olympics"),
    },
  };
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<Query> }) {
  const filters = await searchParams;
  const players = await readPlayers({});
  const leftId = players.some(p => String(p.id) === filters.left) ? filters.left! : String(players[0]?.id ?? "");
  const rightId = players.some(p => String(p.id) === filters.right && String(p.id) !== leftId)
    ? filters.right!
    : String(players.find(p => String(p.id) !== leftId)?.id ?? "");
  const [left, right] = await Promise.all([
    leftId ? readPlayerProfile(leftId) : Promise.resolve(null),
    rightId ? readPlayerProfile(rightId) : Promise.resolve(null),
  ]);
  return (
    <main style={{ padding: "2rem", maxWidth: 1050, margin: "0 auto" }}>
      <Link href="/players">← Players</Link>
      <h1 style={{ fontSize: "2.5rem" }}>Your Debate. Your Criteria.</h1>
      <p style={{ color: "#aaa", marginBottom: "1.75rem" }}>
        Put two NBA careers side by side and decide which accomplishments matter most to you.
        No secret formula. No automatically crowned winner.
      </p>
      <form action="/compare" method="get" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "end", marginBottom: "2rem" }}>
        <label style={{ display: "grid", gap: "0.4rem", flex: "1 1 220px" }}>
          First player
          <select name="left" defaultValue={leftId} style={{ padding: "0.7rem", background: "#222", color: "white", border: "1px solid #666", borderRadius: 8 }}>
            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label style={{ display: "grid", gap: "0.4rem", flex: "1 1 220px" }}>
          Second player
          <select name="right" defaultValue={rightId} style={{ padding: "0.7rem", background: "#222", color: "white", border: "1px solid #666", borderRadius: 8 }}>
            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <button type="submit" style={{ background: "#d3b26c", color: "#161616", fontWeight: 700, padding: "0.75rem 1rem", border: 0, borderRadius: 8, cursor: "pointer" }}>Compare</button>
      </form>
      {left && right && left.player.id !== right.player.id ? (
        <ComparisonBoard left={makeComparison(left)} right={makeComparison(right)} />
      ) : (
        <p role="status">Select two different players with available records to begin. We never invent missing statistics.</p>
      )}
    </main>
  );
}
