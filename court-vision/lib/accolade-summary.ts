export type AccoladeRecord = {
  league: string | null;
  accolade_name: string;
  accolade_type?: string | null;
  result?: string | null;
  season_year?: number | null;
  season_label?: string | null;
  verification_status?: string | null;
};

const NBA_CATEGORIES = [
  ["MVPs", "NBA MVP"],
  ["Finals MVPs", "NBA Finals MVP"],
  ["Defensive Player of the Year", "NBA Defensive Player of the Year"],
  ["Rookie of the Year", "NBA Rookie of the Year"],
  ["All-NBA", "All-NBA"],
  ["All-Defensive", "NBA All-Defensive Team"],
  ["All-Star", "NBA All-Star"],
  ["All-Rookie", "NBA All-Rookie Team"],
  ["Scoring Titles", "NBA Scoring Champion"],
  ["Steals Titles", "NBA Steals Leader"],
] as const;

export function summarizeAccolades(records: AccoladeRecord[]) {
  const categories = NBA_CATEGORIES.map(([label, name]) => ({ label, name, count: 0 }));
  let olympicMedals = 0;
  const counted = new Set<string>();
  const matching: AccoladeRecord[] = [];

  for (const record of records) {
    const category = record.league === "NBA"
      ? categories.find(item => item.name === record.accolade_name)
      : undefined;
    const olympics = record.league === "Olympics" &&
      ["Olympic Gold Medal", "Olympic Silver Medal", "Olympic Bronze Medal"].includes(record.accolade_name);
    if (!category && !olympics) continue;

    // Avoid counting repeated imports of the same honor. Distinct results,
    // seasons and awards remain distinct. Missing season keys warrant review.
    const year = record.season_year ?? record.season_label ?? "unknown";
    const key = [record.league, record.accolade_name, record.result ?? "", year].join("|");
    if (counted.has(key)) continue;
    counted.add(key);
    matching.push(record);
    if (category) category.count++;
    else olympicMedals++;
  }

  const nbaCount = categories.reduce((sum, category) => sum + category.count, 0);
  const needsReview = matching.some(record =>
    record.verification_status !== "cross_checked"
  );
  const missingSeasons = matching.some(record =>
    record.season_year == null && !record.season_label
  );
  return {
    categories,
    nbaCount,
    olympicMedals,
    combinedCount: nbaCount + olympicMedals,
    hasRecords: matching.length > 0,
    // Counts are a coverage-limited snapshot, not an exhaustive claim.
    provisional: needsReview || missingSeasons,
  };
}
