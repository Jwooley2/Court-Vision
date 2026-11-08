import Link from "next/link";
import { notFound } from "next/navigation";
import { readPlayerProfile, readPlayers } from "@/lib/player-data";
import CareerStatsPanel, { ComparePlayer } from "./CareerStatsPanel";
import { summarizeAccolades } from "@/lib/accolade-summary";
import { groupLegacyHonors } from "@/lib/legacy-honors";
import { readPlayoffShooting } from "@/lib/playoff-shooting-sources";

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

  const profile = await readPlayerProfile(id);
  if (!profile) notFound();
  const { player, careerStats, accolades, playoffs } = profile;
  const playoffShooting = readPlayoffShooting(player.external_id, playoffs.games);
  const playoffSummary = playoffShooting && playoffs.summary
    ? { ...playoffs, summary: { ...playoffs.summary, career_fg_pct: playoffShooting.percentage } }
    : playoffs;
  // Comparison directory is optional: an outage must not hide the player profile.
  const comparisonPlayers = await readPlayers({}).catch(() => []);

  const typedAccolades = (accolades || []) as PlayerAccolade[];
  const legacyHonors = groupLegacyHonors(typedAccolades);
  const groupedAccolades = groupAccolades(typedAccolades.filter(accolade =>
    accolade.league === "NBA" &&
    !["hall_of_fame", "anniversary_team", "other", "skill_contest"].includes(accolade.accolade_type)
  ));
  const honorSummary = summarizeAccolades(typedAccolades);

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

      {(!careerStats || typedAccolades.length === 0) && (
        <p role="status">
          This profile is incomplete. Unavailable data is shown as —; it does not mean zero.
        </p>
      )}

      <section style={{ marginBottom: "2rem" }}>
        <h2>Career Overview</h2>

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

      <CareerStatsPanel playerId={Number(id)} playerName={player.name}
        regular={careerStats} playoffs={playoffSummary} playoffShooting={playoffShooting}
        players={comparisonPlayers as ComparePlayer[]} />

      <section style={{ marginBottom: "2rem" }} aria-labelledby="individual-honors-heading">
        <h2 id="individual-honors-heading">Individual Accolades</h2>
        {!honorSummary.hasRecords ? (
          <p role="status">Individual award totals are not available for this profile yet.</p>
        ) : (
          <>
            <p>
              Recorded NBA individual accolades: <strong>{honorSummary.nbaCount}</strong>
              {" • "}Olympic medals: <strong>{honorSummary.olympicMedals}</strong>
              {" • "}Combined selected honors: <strong>{honorSummary.combinedCount}</strong>
            </p>
            <p style={{ color: "#bbb" }}>
              {honorSummary.provisional
                ? "Provisional counts; independent source verification is incomplete."
                : "Counts are verified for these categories; other honors are listed below."}
              {" "}NBA championships are excluded from individual accolade totals.
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              columnGap: "2rem", rowGap: "0.5rem",
            }}>
              {honorSummary.categories.map(category => (
                <div key={category.name} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{category.label}</span><strong>{category.count}</strong>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Accolade Summary</h2>
        <p>Counts reflect recorded accolades and may be incomplete.</p>

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
                {typedAccolades.length > 0 ? highlight.value : "—"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <details>
          <summary style={{ cursor: "pointer", fontSize: "1.35rem", fontWeight: 700 }}>
            NBA Awards — Year-by-Year Details
          </summary>
          {groupedAccolades.length === 0 ? (
            <p>NBA award details are not available for this profile yet.</p>
          ) : groupedAccolades.map(([groupName, groupItems]) => (
            <div key={groupName} style={{ marginBottom: "1rem" }}>
              <h3>{groupName} ({groupItems.length})</h3>
              <ul>
                {groupItems.map(accolade => (
                  <li key={accolade.id}>
                    <strong>{accolade.accolade_name}</strong>
                    {formatAccoladeDetails(accolade) ? ` — ${formatAccoladeDetails(accolade)}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </details>
      </section>

      <section aria-label="College and other basketball honors" style={{ marginBottom: "2rem" }}>
        <details>
          <summary style={{ cursor: "pointer", fontSize: "1.35rem", fontWeight: 700 }}>
            College &amp; Other Basketball Honors
          </summary>
          <p style={{ color: "#bbb" }}>
            College, international, Hall of Fame and other notable basketball achievements
            contribute to a player&apos;s overall legacy, but they are kept separate from NBA
            career statistics and the NBA individual accolade total. Olympic medals are
            already included in the distinct Olympic subtotal above.
          </p>
          {legacyHonors.length === 0 ? (
            <p>No additional basketball honors have been recorded for this player yet.</p>
          ) : legacyHonors.map(group => (
            <div key={group.title} style={{ marginBottom: "1.5rem" }}>
              <h3>{group.title}</h3>
              <ul>
                {group.records.map(accolade => (
                  <li key={accolade.id}>
                    <strong>{accolade.accolade_name}</strong>
                    {formatAccoladeDetails(accolade) ? ` — ${formatAccoladeDetails(accolade)}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p style={{ color: "#bbb" }}>
            Listed honors reflect available records and may require further verification.
            No legacy-honors score or weighting is implied.
          </p>
        </details>
      </section>

    </main>
  );
}