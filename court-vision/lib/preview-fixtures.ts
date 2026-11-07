// Synthetic examples only. These are not real players or sourced basketball stats.
export function isPreviewFixtureMode() {
  return process.env.VERCEL_ENV === "preview" &&
    process.env.COURT_VISION_PREVIEW_FIXTURES === "true";
}

const career = {
  player_id: 9001, games_played: 10, seasons_played: 1,
  career_ppg: 20, career_rpg: 5, career_apg: 7,
};

const players = [
  {
    id: 9001, name: "Sample Guard", position: "PG", era: "2020s",
    championships: null, mvps: null, hall_of_fame: null,
    player_career_stats: [career],
  },
  {
    id: 9002, name: "Sample Forward", position: "SF", era: "1990s",
    championships: null, mvps: null, hall_of_fame: null,
    player_career_stats: [],
  },
];

const tables: Record<string, Record<string, unknown>[]> = {
  players,
  player_career_stats: [career],
  player_accolades: [],
  player_seasons: [{
    id: 1, player_id: 9001, season_label: "2020-21", season_year: 2021,
    season_type: "regular_season", league: "NBA", age: 25,
    games_played: 10, points_per_game: 20, rebounds_per_game: 5,
    assists_per_game: 7, teams: { name: "Sample Team", abbreviation: "TEST" },
    source_citation_required: false, primary_source_url: null,
  }],
};

// Intercept only this synthetic origin. No network or database writes exist in
// this adapter; production cannot enable it through the flag alone.
export const previewFixtureFetch: typeof fetch = async (input, init) => {
  if (!isPreviewFixtureMode()) throw new Error("Preview fixtures are disabled");
  init?.signal?.throwIfAborted();
  const url = new URL(input instanceof Request ? input.url : input);
  const method = init?.method ?? (input instanceof Request ? input.method : "GET");
  if (url.origin !== "https://court-vision-fixtures.invalid" || method !== "GET") {
    return Response.json({ message: "Fixture request rejected" }, { status: 405 });
  }
  const match = /^\/rest\/v1\/(players|player_career_stats|player_accolades|player_seasons)$/.exec(url.pathname);
  if (!match) return Response.json({ message: "Unknown fixture table" }, { status: 404 });
  let rows = [...tables[match[1]]];
  for (const [field, filter] of url.searchParams) {
    if (["select", "order"].includes(field)) continue;
    if (filter.startsWith("eq.")) rows = rows.filter(row => String(row[field]) === filter.slice(3));
    else if (field === "name" && filter.startsWith("ilike.")) {
      const pattern = filter.slice(6).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/%/g, ".*").replace(/_/g, ".");
      rows = rows.filter(row => new RegExp(`^${pattern}$`, "i").test(String(row.name)));
    } else if (filter.startsWith("in.(") && filter.endsWith(")")) {
      const values = filter.slice(4, -1).split(",");
      rows = rows.filter(row => values.includes(String(row[field])));
    } else {
      return Response.json({ message: "Unsupported fixture filter" }, { status: 400 });
    }
  }
  if (url.searchParams.get("order") === "name.asc") {
    rows.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }
  return Response.json(rows);
};
