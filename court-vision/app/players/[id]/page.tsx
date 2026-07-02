import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SeasonStatsTable, { PlayerSeason } from "./SeasonStatsTable";

function formatStat(value: number | string | null | undefined, decimals = 1) {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(decimals);
}

function formatPercent(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${(Number(value) * 100).toFixed(1)}%`;
}

type PlayerAccolade = {
  id: number;
  league: string | null;
  accolade_type: string;
  accolade_name: string;
  result: string | null;
  season_year: number | null;
  season_label: string | null;
  team: string | null;
  is_major: boolean | null;
  notes: string | null;
};

const ACCOLADE_TYPE_LABELS: Record<string, string> = {
  championship: "Championships",
  finals_mvp: "Finals MVPs",
  mvp: "MVPs",
  defensive_award: "Defensive Awards",
  rookie_award: "Rookie Honors",
  all_nba: "All-NBA",
  all_defense: "All-Defense",
  all_star: "All-Star",
  statistical_title: "Statistical Titles",
  skill_contest: "Skill Contests",
  anniversary_team: "Anniversary Teams",
  hall_of_fame: "Hall of Fame",
  international: "International",
  college: "College",
  other: "Other Honors",
};

const ACCOLADE_GROUP_ORDER = [
  "Championships",
  "Finals MVPs",
  "MVPs",
  "Defensive Awards",
  "All-NBA",
  "All-Defense",
  "All-Star",
  "Statistical Titles",
  "Rookie Honors",
  "Hall of Fame",
  "Anniversary Teams",
  "International",
  "College",
  "Skill Contests",
  "Other Honors",
];

function countAccolades(
  accolades: PlayerAccolade[],
  accoladeName: string,
  result?: string
) {
  return accolades.filter((accolade) => {
    const nameMatches = accolade.accolade_name === accoladeName;
    const resultMatches = result === undefined || accolade.result === result;

    return nameMatches && resultMatches;
  }).length;
}

function groupAccolades(
  accolades: PlayerAccolade[]
): Array<[string, PlayerAccolade[]]> {
  const grouped: Record<string, PlayerAccolade[]> = {};

  for (const accolade of accolades) {
    const groupName =
      ACCOLADE_TYPE_LABELS[accolade.accolade_type] || "Other Honors";

    if (!grouped[groupName]) {
      grouped[groupName] = [];
    }

    grouped[groupName].push(accolade);
  }

  return ACCOLADE_GROUP_ORDER.map(
    (groupName): [string, PlayerAccolade[]] => [
      groupName,
      grouped[groupName] || [],
    ]
  ).filter(([, groupItems]) => groupItems.length > 0);
}

function formatAccoladeDetails(accolade: PlayerAccolade) {
  const details = [
    accolade.result,
    accolade.season_label,
    accolade.team,
    accolade.league,
  ].filter(Boolean);

  return details.join(" • ");
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

  const { data: accolades, error: accoladesError } = await supabase
    .from("player_accolades")
    .select("*")
    .eq("player_id", id)
    .order("season_year", { ascending: true, nullsFirst: false })
    .order("accolade_name", { ascending: true });

  const { data: seasons, error: seasonsError } = await supabase
    .from("player_seasons")
    .select(
      `
        *,
        teams (
          name,
          abbreviation
        )
      `
    )
    .eq("player_id", id)
    .eq("league", "NBA")
    .in("season_type", ["regular_season", "playoffs"])
    .order("season_year", { ascending: true });

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

  if (accoladesError) {
    return (
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <Link href="/players">← Back to Players</Link>
        <h1>{player.name}</h1>
        <p>Error loading accolades: {accoladesError.message}</p>
      </main>
    );
  }

  if (seasonsError) {
    return (
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <Link href="/players">← Back to Players</Link>
        <h1>{player.name}</h1>
        <p>Error loading season stats: {seasonsError.message}</p>
      </main>
    );
  }

  const typedAccolades = (accolades || []) as PlayerAccolade[];
  const groupedAccolades = groupAccolades(typedAccolades);
  const typedSeasons = (seasons || []) as PlayerSeason[];

  const accoladeHighlights = [
    {
      label: "Championships",
      value: countAccolades(typedAccolades, "NBA Champion"),
    },
    {
      label: "Finals MVPs",
      value: countAccolades(typedAccolades, "NBA Finals MVP"),
    },
    {
      label: "MVPs",
      value: countAccolades(typedAccolades, "NBA MVP"),
    },
    {
      label: "All-NBA 1st Team",
      value: countAccolades(typedAccolades, "All-NBA", "First Team"),
    },
    {
      label: "All-Defense 1st Team",
      value: countAccolades(
        typedAccolades,
        "NBA All-Defensive Team",
        "First Team"
      ),
    },
    {
      label: "All-Star",
      value: countAccolades(typedAccolades, "NBA All-Star"),
    },
    {
      label: "Scoring Titles",
      value: countAccolades(typedAccolades, "NBA Scoring Champion"),
    },
    {
      label: "Steals Titles",
      value: countAccolades(typedAccolades, "NBA Steals Leader"),
    },
  ];

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

      <SeasonStatsTable seasons={typedSeasons} />

      <section style={{ marginBottom: "2rem" }}>
        <h2>Accolade Summary</h2>

        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          }}
        >
          {accoladeHighlights.map((highlight) => (
            <div
              key={highlight.label}
              style={{
                border: "1px solid #444",
                borderRadius: "12px",
                padding: "1rem",
                background: "#111",
              }}
            >
              <p style={{ margin: 0, color: "#bbb" }}>{highlight.label}</p>
              <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: "bold" }}>
                {highlight.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Career Accolades</h2>

        {groupedAccolades.length === 0 ? (
          <p>No accolades found.</p>
        ) : (
          groupedAccolades.map(
            ([groupName, groupItems]: [string, PlayerAccolade[]]) => (
              <div key={groupName} style={{ marginBottom: "1.5rem" }}>
                <h3>
                  {groupName} ({groupItems.length})
                </h3>

                <ul>
                  {groupItems.map((accolade) => (
                    <li key={accolade.id}>
                      <strong>{accolade.accolade_name}</strong>
                      {formatAccoladeDetails(accolade)
                        ? ` — ${formatAccoladeDetails(accolade)}`
                        : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )
        )}
      </section>
    </main>
  );
}