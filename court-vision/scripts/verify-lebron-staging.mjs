import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const file = new URL("../data/staging/lebron-james-through-2025-26.json", import.meta.url);
const player = JSON.parse(readFileSync(file, "utf8"));
assert.equal(player.status, "staged_review_only");
assert.equal(player.allow_production_import, false);
assert.equal(player.player.external_id, "lebron_james");
assert.equal(player.player.career_cutoff, "2025-26");
assert.equal(player.player.seasons_played, 23);

function checkPeriod(name, record, expectedGames, expectedPoints) {
  assert.equal(record.games_played, expectedGames);
  assert.equal(record.points, expectedPoints);
  for (const key of ["points", "rebounds", "assists", "steals", "blocks", "fgm", "fga", "three_pm", "three_pa", "ftm", "fta"]) {
    assert.ok(Number.isInteger(record[key]) && record[key] >= 0, `${name}.${key} must be an integer total`);
  }
  for (const [made, attempted] of [["fgm", "fga"], ["three_pm", "three_pa"], ["ftm", "fta"]]) {
    assert.ok(record[made] <= record[attempted], `${name} invalid shooting attempt totals`);
  }
  const averages = Object.fromEntries(
    ["points", "rebounds", "assists", "steals", "blocks"].map(k =>
      [k, Number((record[k] / record.games_played).toFixed(1))])
  );
  const fgPct = Number((100 * record.fgm / record.fga).toFixed(1));
  assert.equal(record.verification_status, "cross_checked");
  assert.ok(record.sources.some(src => src.includes("nba.com/")));
  assert.ok(record.sources.some(src => src.includes("basketball-reference.com/")));
  console.log(`PASS ${name}: ${expectedGames} GP, ${averages.points} PPG, ${fgPct}% FG`);
  return { averages, fgPct };
}
const regular = checkPeriod("regular", player.regular_season, 1622, 43440);
assert.deepEqual(regular.averages, {
  points: 26.8, rebounds: 7.5, assists: 7.4, steals: 1.5, blocks: 0.7
});
assert.equal(regular.fgPct, 50.7);
const playoffs = checkPeriod("playoffs", player.playoffs, 302, 8521);
assert.deepEqual(playoffs.averages, {
  points: 28.2, rebounds: 8.9, assists: 7.2, steals: 1.7, blocks: 1.0
});
assert.equal(playoffs.fgPct, 49.5);

const categories = player.honors.nba_individual_categories;
assert.equal(Object.values(categories).reduce((a,b)=>a+b,0), 61);
assert.equal(categories.assists_titles, 1);
assert.equal(categories.steals_titles, 0);
assert.equal(player.honors.excluded_from_individual.championships, 4);
assert.equal(player.honors.international.olympic_gold_medals.length, 3);
assert.equal(player.honors.international.olympic_bronze_medals.length, 1);
assert.equal(Object.values(categories).every(v => Number.isInteger(v) && v>=0),true);
assert.ok(player.honors.verification_status.includes("category_counts_only"));
console.log("PASS honors: 61 selected NBA individual categories; 4 Olympic medals; no fabricated year-by-year awards");
console.log("PASS package: staging only; production import disabled");

const eventFile = new URL("../data/staging/lebron-james-honor-events-through-2025-26.json", import.meta.url);
const honors = JSON.parse(readFileSync(eventFile, "utf8"));
assert.equal(honors.status, "staged_review_only");
assert.equal(honors.allow_production_import, false);
assert.equal(honors.player_external_id, player.player.external_id);
assert.equal(honors.cutoff, player.player.career_cutoff);
assert.equal(honors.events.length, 65);
const awardEvents = honors.events.filter(row => row.league === "NBA");
const medals = honors.events.filter(row => row.league === "Olympics");
assert.equal(awardEvents.length, 61);
assert.equal(medals.length, 4);
const count = (name, result) => awardEvents.filter(row => row.accolade_name === name &&
  (result === undefined || row.result === result)).length;
for (const [name, expected] of [
  ["NBA MVP", 4], ["NBA Finals MVP", 4], ["NBA Rookie of the Year", 1],
  ["NBA All-Rookie Team", 1], ["All-NBA", 21],
  ["NBA All-Defensive Team", 6], ["NBA All-Star", 22],
  ["NBA Scoring Champion", 1], ["NBA Assists Leader", 1],
]) assert.equal(count(name), expected, name);
assert.equal(count("All-NBA", "First Team"), 13);
assert.equal(count("All-NBA", "Second Team"), 4);
assert.equal(count("All-NBA", "Third Team"), 4);
assert.equal(count("NBA All-Defensive Team", "First Team"), 5);
assert.equal(count("NBA All-Defensive Team", "Second Team"), 1);
assert.equal(medals.filter(x => x.accolade_name === "Olympic Gold Medal").length, 3);
assert.equal(medals.filter(x => x.accolade_name === "Olympic Bronze Medal").length, 1);
const keys = new Set();
for (const event of honors.events) {
  assert.ok(Number.isInteger(event.season_year) && event.season_year >= 2003 && event.season_year <= 2026);
  assert.ok(["staged_pending_event_level_cross_check", "cross_checked_year_and_tier"].includes(event.review_status));
  if (event.review_status === "cross_checked_year_and_tier") {
    assert.ok(event.secondary_source_url?.includes("nba.com/gamenotes/"));
  }
  const key = [event.league, event.accolade_name, event.result, event.season_year].join("|");
  assert.ok(!keys.has(key), "duplicate honor event: " + key);
  keys.add(key);
}
assert.equal(honors.events.filter(row => row.review_status === "cross_checked_year_and_tier").length, 39);
assert.equal(honors.events.filter(row => row.review_status === "staged_pending_event_level_cross_check").length, 26);
console.log("PASS dated honors: 61 NBA events, 4 Olympic medals, 39 event-level cross-checks, 26 pending, no duplicates");
