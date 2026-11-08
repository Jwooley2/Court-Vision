import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Deliberately no database client, network imports or write operations.
// This command only prepares a proposed mapping report on stdout.
const summary = JSON.parse(readFileSync(new URL("../data/staging/lebron-james-through-2025-26.json", import.meta.url), "utf8"));
const honors = JSON.parse(readFileSync(new URL("../data/staging/lebron-james-honor-events-through-2025-26.json", import.meta.url), "utf8"));
const playerId = summary.player.database_player_id;
assert.equal(summary.allow_production_import, false);
assert.equal(honors.allow_production_import, false);
assert.equal(summary.player.external_id, honors.player_external_id);
assert.equal(summary.player.career_cutoff, honors.cutoff);
assert.ok(Number.isSafeInteger(playerId) && playerId > 0);
assert.ok(honors.events.every(e => e.review_status === "cross_checked_year_and_tier"));

const regular = summary.regular_season;
const rate = (total) => total / regular.games_played;
const career = {
  player_id: playerId,
  games_played: regular.games_played,
  seasons_played: summary.player.seasons_played,
  career_ppg: rate(regular.points),
  career_rpg: rate(regular.rebounds),
  career_apg: rate(regular.assists),
  career_spg: rate(regular.steals),
  career_bpg: rate(regular.blocks),
  career_fg_pct: regular.fgm / regular.fga,
  career_3p_pct: regular.three_pm / regular.three_pa,
  career_ft_pct: regular.ftm / regular.fta,
  primary_source: "NBA official leaders (end of 2025-26)",
  secondary_source: "Sports Reference (end of 2025-26)",
  verification_status: "cross_checked",
  verification_notes: "2025-26 closed-season cutoff. No 2026-27 totals. Offline mapping preview only.",
};
const accoladeRows = honors.events.map((event) => ({
  player_id: playerId,
  league: event.league,
  accolade_type: event.accolade_type,
  accolade_name: event.accolade_name,
  season_year: event.season_year,
  season_label: event.season_label ?? String(event.season_year),
  result: event.result ?? null,
  primary_source: "Land of Basketball event timeline",
  secondary_source: "NBA official source",
  verification_status: "cross_checked",
  verification_notes: "Year-level document cross-check; offline import preview; requires founder-approved transaction.",
}));
assert.equal(accoladeRows.length, 65);
assert.equal(accoladeRows.filter(row=>row.league==="NBA").length, 61);
assert.equal(accoladeRows.filter(row=>row.league==="Olympics").length, 4);
assert.equal(career.games_played, 1622);
assert.equal(career.seasons_played, 23);
const preview = {
  operation: "PROPOSED_ONLY",
  execute_enabled: false,
  database_connection: false,
  expected_existing_identity: { id: playerId, external_id: summary.player.external_id },
  proposed_career_summary_rows: 1,
  proposed_accolade_rows: accoladeRows.length,
  proposed_season_rows: 0,
  deletes: 0,
  writes_executed: 0,
  comparison_required_before_approval: [
    "Verify identity ID 7 belongs to lebron_james and capture snapshot",
    "Compare all 66 proposed records with current production rows",
    "Confirm source year, category and data-usage rights",
    "Test idempotent transaction and rollback in isolated database",
    "Receive founder's new explicit write approval",
  ],
  mapped_career_summary: career,
  accolade_categories: Object.fromEntries([...new Set(accoladeRows.map(x=>x.accolade_name))].map(name=>
    [name, accoladeRows.filter(x=>x.accolade_name===name).length])),
};
console.log(JSON.stringify(preview, null, 2));
