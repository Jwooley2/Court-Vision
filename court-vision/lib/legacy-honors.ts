import type { AccoladeRecord } from "./accolade-summary";

/**
 * Separate non-NBA accomplishments from the professional NBA award count.
 * This is a presentation classification, not an additional numerical score.
 */
export function groupLegacyHonors<T extends AccoladeRecord>(records: T[]) {
  const college: T[] = [];
  const international: T[] = [];
  const other: T[] = [];
  const seen = new Set<string>();

  for (const record of records) {
    const league = (record.league ?? "").trim().toUpperCase();
    const name = record.accolade_name;
    const isCollege = record.accolade_type === "college" ||
      ["NCAA", "ACC", "BIG TEN", "BIG 12", "SEC", "PAC-12", "BIG EAST"].includes(league);
    const isInternational = record.accolade_type === "international" ||
      ["OLYMPICS", "FIBA", "USA BASKETBALL", "PAN AMERICAN GAMES"].includes(league);
    const isOther = !isCollege && !isInternational &&
      ["hall_of_fame", "anniversary_team", "other", "skill_contest"].includes(record.accolade_type ?? "");

    if (!isCollege && !isInternational && !isOther) continue;

    // Deduplicate identical source events without collapsing legitimately distinct seasons.
    const key = [league, name, record.result ?? "", record.season_year ?? record.season_label ?? "unknown"].join("|");
    if (seen.has(key)) continue;
    seen.add(key);

    if (isCollege) college.push(record);
    else if (isInternational) international.push(record);
    else other.push(record);
  }

  return [
    { title: "College & NCAA", records: college },
    { title: "Olympic & International", records: international },
    { title: "Other Basketball Honors", records: other },
  ].filter(group => group.records.length > 0);
}
