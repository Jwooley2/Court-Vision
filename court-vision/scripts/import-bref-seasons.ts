import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

type BrefSeasonRow = Record<string, string>;
type StatMode = "per_game" | "totals";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function requiredArg(name: string) {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));

  if (!value) {
    throw new Error(`Missing required argument: --${name}=...`);
  }

  return value.slice(prefix.length);
}

function optionalArg(name: string, fallback: string) {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));

  return value ? value.slice(prefix.length) : fallback;
}

function toNumber(value: string | undefined) {
  if (value === undefined || value === null || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? null : parsed;
}

function toInteger(value: string | undefined) {
  const parsed = toNumber(value);
  return parsed === null ? null : Math.round(parsed);
}

function normalizeSeasonYear(season: string) {
  const endingYear = season.split("-")[1];

  if (!endingYear) {
    throw new Error(`Could not parse season label: ${season}`);
  }

  const endingYearNumber = Number(endingYear);

  if (Number.isNaN(endingYearNumber)) {
    throw new Error(`Could not parse ending year from season label: ${season}`);
  }

  return endingYearNumber >= 50
    ? 1900 + endingYearNumber
    : 2000 + endingYearNumber;
}

function getFirstValue(row: BrefSeasonRow, keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key].trim() !== "") {
      return row[key];
    }
  }

  return undefined;
}

async function getTeamId(teamAbbreviation: string | undefined) {
  if (!teamAbbreviation || teamAbbreviation === "TOT") {
    return null;
  }

  const { data, error } = await supabase
    .from("teams")
    .select("id")
    .eq("league", "NBA")
    .eq("abbreviation", teamAbbreviation)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Error looking up team ${teamAbbreviation}: ${error.message}`
    );
  }

  return data?.id ?? null;
}

function getCleanRows(rows: BrefSeasonRow[]) {
  return rows.filter((row) => {
    if (!row.Season) return false;
    if (row.Season === "Season") return false;
    if (row.Season === "Career") return false;
    if (row.Season.includes("Yrs")) return false;
    if (!row.Season.includes("-")) return false;

    return true;
  });
}

async function deleteExistingSeasonRow({
  playerId,
  league,
  seasonYear,
  seasonType,
  stintType,
  teamId,
}: {
  playerId: number;
  league: string;
  seasonYear: number;
  seasonType: string;
  stintType: string;
  teamId: number | null;
}) {
  let query = supabase
    .from("player_seasons")
    .delete()
    .eq("player_id", playerId)
    .eq("league", league)
    .eq("season_year", seasonYear)
    .eq("season_type", seasonType)
    .eq("stint_type", stintType);

  if (teamId === null) {
    query = query.is("team_id", null);
  } else {
    query = query.eq("team_id", teamId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(
      `Error deleting existing ${seasonYear} ${seasonType} row: ${error.message}`
    );
  }
}

async function importPerGameRow({
  row,
  playerId,
  seasonType,
  playerSourceUrl,
}: {
  row: BrefSeasonRow;
  playerId: number;
  seasonType: string;
  playerSourceUrl: string;
}) {
  const seasonLabel = row.Season;
  const seasonYear = normalizeSeasonYear(seasonLabel);
  const teamAbbreviation = getFirstValue(row, ["Tm", "Team"]);
  const teamId = await getTeamId(teamAbbreviation);
  const stintType = teamAbbreviation === "TOT" ? "total" : "team";

  await deleteExistingSeasonRow({
    playerId,
    league: "NBA",
    seasonYear,
    seasonType,
    stintType,
    teamId,
  });

  const payload = {
    player_id: playerId,
    team_id: teamId,
    league: "NBA",
    season_year: seasonYear,
    season_label: seasonLabel,
    season_type: seasonType,
    stint_type: stintType,

    age: toInteger(row.Age),
    games_played: toInteger(getFirstValue(row, ["G", "Games"])),
    games_started: toInteger(getFirstValue(row, ["GS", "Games Started"])),
    minutes_per_game: toNumber(getFirstValue(row, ["MP", "MPG"])),

    points_per_game: toNumber(getFirstValue(row, ["PTS", "PPG"])),
    rebounds_per_game: toNumber(getFirstValue(row, ["TRB", "RPG"])),
    assists_per_game: toNumber(getFirstValue(row, ["AST", "APG"])),
    steals_per_game: toNumber(getFirstValue(row, ["STL", "SPG"])),
    blocks_per_game: toNumber(getFirstValue(row, ["BLK", "BPG"])),

    field_goal_pct: toNumber(getFirstValue(row, ["FG%"])),
    three_point_pct: toNumber(getFirstValue(row, ["3P%"])),
    free_throw_pct: toNumber(getFirstValue(row, ["FT%"])),

    player_efficiency_rating: toNumber(getFirstValue(row, ["PER"])),
    true_shooting_pct: toNumber(getFirstValue(row, ["TS%"])),
    usage_pct: toNumber(getFirstValue(row, ["USG%"])),
    win_shares: toNumber(getFirstValue(row, ["WS"])),
    win_shares_per_48: toNumber(getFirstValue(row, ["WS/48"])),
    box_plus_minus: toNumber(getFirstValue(row, ["BPM"])),
    value_over_replacement_player: toNumber(getFirstValue(row, ["VORP"])),

    primary_source: "Sports Reference / Basketball Reference",
    primary_source_url: playerSourceUrl,
    source_citation_required: true,
    source_citation_text:
      "Data sourced from Sports Reference / Basketball Reference. Please cite and link to Basketball-Reference.com when displaying these statistics.",
    advanced_source_family: "basketball_reference",
    advanced_source_notes:
      "Imported from Basketball Reference CSV export into Court Vision.",
    verification_status: "single_source",
    verified_at: new Date().toISOString(),
    verification_notes:
      "Imported per-game season data by Court Vision Basketball Reference CSV importer.",
  };

  const { error } = await supabase.from("player_seasons").insert(payload);

  if (error) {
    throw new Error(
      `Error inserting ${seasonLabel} ${seasonType}: ${error.message}`
    );
  }

  console.log(`Imported ${seasonLabel} ${seasonType} per-game`);
}

async function importTotalsRow({
  row,
  playerId,
  seasonType,
}: {
  row: BrefSeasonRow;
  playerId: number;
  seasonType: string;
}) {
  const seasonLabel = row.Season;
  const seasonYear = normalizeSeasonYear(seasonLabel);
  const teamAbbreviation = getFirstValue(row, ["Tm", "Team"]);
  const teamId = await getTeamId(teamAbbreviation);
  const stintType = teamAbbreviation === "TOT" ? "total" : "team";

  let query = supabase
    .from("player_seasons")
    .update({
      minutes_total: toInteger(getFirstValue(row, ["MP", "Minutes"])),
      points_total: toInteger(getFirstValue(row, ["PTS", "Points"])),
      rebounds_total: toInteger(getFirstValue(row, ["TRB", "Rebounds"])),
      assists_total: toInteger(getFirstValue(row, ["AST", "Assists"])),
      steals_total: toInteger(getFirstValue(row, ["STL", "Steals"])),
      blocks_total: toInteger(getFirstValue(row, ["BLK", "Blocks"])),
      verified_at: new Date().toISOString(),
      verification_notes:
        "Updated season totals by Court Vision Basketball Reference CSV importer.",
    })
    .eq("player_id", playerId)
    .eq("league", "NBA")
    .eq("season_year", seasonYear)
    .eq("season_type", seasonType)
    .eq("stint_type", stintType);

  if (teamId === null) {
    query = query.is("team_id", null);
  } else {
    query = query.eq("team_id", teamId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(
      `Error updating totals for ${seasonLabel} ${seasonType}: ${error.message}`
    );
  }

  console.log(`Updated ${seasonLabel} ${seasonType} totals`);
}

async function main() {
  const playerId = Number(requiredArg("playerId"));
  const filePath = requiredArg("file");
  const seasonType = optionalArg("seasonType", "regular_season");
  const statMode = optionalArg("statMode", "per_game") as StatMode;
  const playerSourceUrl = optionalArg(
    "sourceUrl",
    "https://www.basketball-reference.com/players/j/jordami01.html"
  );

  if (!["regular_season", "playoffs"].includes(seasonType)) {
    throw new Error("--seasonType must be regular_season or playoffs");
  }

  if (!["per_game", "totals"].includes(statMode)) {
    throw new Error("--statMode must be per_game or totals");
  }

  if (Number.isNaN(playerId)) {
    throw new Error("--playerId must be a number");
  }

  const absolutePath = path.resolve(filePath);
  const csvText = fs.readFileSync(absolutePath, "utf8");

  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as BrefSeasonRow[];

  const cleanRows = getCleanRows(rows);

  if (cleanRows.length === 0) {
    throw new Error("No usable season rows found in CSV.");
  }

  for (const row of cleanRows) {
    if (statMode === "per_game") {
      await importPerGameRow({
        row,
        playerId,
        seasonType,
        playerSourceUrl,
      });
    }

    if (statMode === "totals") {
      await importTotalsRow({
        row,
        playerId,
        seasonType,
      });
    }
  }

  console.log("Import complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});