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
