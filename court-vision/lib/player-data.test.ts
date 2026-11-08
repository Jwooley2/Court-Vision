import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { readPlayerProfile, readPlayers } from "./player-data";
import { PlayerDataError, withPlayerRead } from "./supabase";
import { renderToStaticMarkup } from "react-dom/server";
import PlayerProfilePage from "../app/players/[id]/page";
import CareerStatsPanel from "../app/players/[id]/CareerStatsPanel";
import { createElement } from "react";
import { isPreviewFixtureMode, previewFixtureFetch } from "./preview-fixtures";
import { summarizeAccolades, AccoladeRecord } from "./accolade-summary";
import { groupLegacyHonors } from "./legacy-honors";
import { summarizePlayoffSeasons } from "./playoff-summary";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const originalVercelEnv = process.env.VERCEL_ENV;
const originalFixtureMode = process.env.COURT_VISION_PREVIEW_FIXTURES;
const calls: URL[] = [];
const response = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

function fixture(reply: (url: URL, init?: RequestInit) => Response | Promise<Response>) {
  mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input);
    assert.equal(url.origin, "https://fixture.invalid");
    assert.equal(init?.method, "GET");
    calls.push(url);
    return reply(url, init);
  });
}

beforeEach(() => {
  calls.length = 0;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fixture.invalid";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "fixture-only-key";
  delete process.env.COURT_VISION_PREVIEW_FIXTURES;
  // Every test replaces fetch; an unexpected network attempt fails closed.
  fixture(() => { throw new Error("Unexpected fixture request"); });
});

afterEach(() => {
  mock.restoreAll();
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  if (originalVercelEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalVercelEnv;
  if (originalFixtureMode === undefined) delete process.env.COURT_VISION_PREVIEW_FIXTURES;
  else process.env.COURT_VISION_PREVIEW_FIXTURES = originalFixtureMode;
});

test("preview fixtures load through the SDK without real configuration or network", async () => {
  process.env.VERCEL_ENV = "preview";
  process.env.COURT_VISION_PREVIEW_FIXTURES = "true";
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  assert.equal((await readPlayers({})).length, 2);
  assert.equal((await readPlayerProfile("9001"))?.careerStats.games_played, 10);
  assert.equal((await readPlayerProfile("9002"))?.careerStats, null);
  assert.equal(await readPlayerProfile("9999"), null);
  assert.equal(calls.length, 0);
});

test("preview fixture filters handle search, position, era and no matches", async () => {
  process.env.VERCEL_ENV = "preview";
  process.env.COURT_VISION_PREVIEW_FIXTURES = "true";
  assert.equal((await readPlayers({ search: "guard", position: "PG", era: "2020s" }))[0].id, 9001);
  assert.equal((await readPlayers({ search: "Forward" }))[0].id, 9002);
  assert.deepEqual(await readPlayers({ search: "No match" }), []);
  assert.deepEqual(await readPlayers({ search: "*?" }), []);
});

test("fixture flag cannot replace production data or enable writes", async () => {
  process.env.COURT_VISION_PREVIEW_FIXTURES = "true";
  process.env.VERCEL_ENV = "production";
  assert.equal(isPreviewFixtureMode(), false);
  await assert.rejects(previewFixtureFetch("https://court-vision-fixtures.invalid/rest/v1/players"));
  fixture(() => response([]));
  await readPlayers({});
  assert.equal(calls.length, 1); // Still uses the configured normal data path.
  process.env.VERCEL_ENV = "preview";
  assert.equal((await previewFixtureFetch("https://court-vision-fixtures.invalid/rest/v1/players", { method: "POST" })).status, 405);
  assert.equal((await previewFixtureFetch("https://unexpected.invalid/rest/v1/players")).status, 405);
  assert.equal((await previewFixtureFetch("https://court-vision-fixtures.invalid/rest/v1/private")).status, 404);
});

test("invalid IDs make no requests, even when configuration is missing", async () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  for (const id of ["0", "-1", "1.1", "abc", "1e2", "9007199254740992"]) {
    assert.equal(await readPlayerProfile(id), null);
  }
  assert.equal(calls.length, 0);
});

test("confirmed absence stops after identity", async () => {
  fixture(() => response([]));
  assert.equal(await readPlayerProfile("7"), null);
  assert.deepEqual(calls.map(url => url.pathname), ["/rest/v1/players"]);
});

test("identity failure is sanitized and does not query details or retry", async () => {
  fixture(() => response({ message: "private backend payload", code: "XX000" }, 503));
  await assert.rejects(readPlayerProfile("7"), {
    name: "PlayerDataError", message: "Player data unavailable (unavailable)",
  });
  assert.equal(calls.length, 1);
});

test("valid profile reads career accolades and narrow playoff totals concurrently", async () => {
  let detailStarts = 0;
  let release!: () => void;
  const allStarted = new Promise<void>(resolve => { release = resolve; });
  fixture(async url => {
    if (url.pathname.endsWith("/players")) return response([{ id: 1, name: "Fixture Player" }]);
    detailStarts++;
    if (detailStarts === 3) release();
    await allStarted;
    if (url.pathname.endsWith("/player_career_stats")) return response([{ games_played: 10 }]);
    return response([{ id: 1 }]);
  });
  const profile = await readPlayerProfile("1");
  assert.equal(profile?.careerStats.games_played, 10);
  assert.equal(profile?.accolades.length, 1);
  assert.equal(detailStarts, 3);
  const seasonQuery = calls.find(url => url.pathname.endsWith("/player_seasons"));
  assert.ok(seasonQuery);
  assert.equal(seasonQuery.searchParams.get("season_type"), "eq.playoffs");
  assert.equal(seasonQuery.searchParams.get("league"), "eq.NBA");
  assert.ok(seasonQuery.searchParams.get("select")?.includes("points_total"));
  assert.ok(!seasonQuery.searchParams.get("select")?.includes("*"));
});

test("missing optional data stays missing rather than becoming zero", async () => {
  fixture(url => response(url.pathname.endsWith("/players") ? [{ id: 7 }] : []));
  const profile = await readPlayerProfile("7");
  assert.equal(profile?.careerStats, null);
  assert.deepEqual(profile?.accolades, []);
  assert.equal(profile?.playoffs.summary, null);
});

test("incomplete profile renders unknown accolades, never fabricated zero totals", async () => {
  fixture(url => response(url.pathname.endsWith("/players") ? [{ id: 7, name: "Fixture Player" }] : []));
  const html = renderToStaticMarkup(await PlayerProfilePage({ params: Promise.resolve({ id: "7" }) }));
  assert.ok(html.includes("This profile is incomplete"));
  assert.ok(html.includes("Individual award totals are not available"));
  assert.equal((html.match(/font-weight:bold">—<\/p>/g) ?? []).length, 8);
  assert.equal((html.match(/font-weight:bold">0<\/p>/g) ?? []).length, 0);
});

test("detail-table failure is unavailable, never a missing player", async () => {
  fixture(url => url.pathname.endsWith("/players")
    ? response([{ id: 7 }])
    : response({ message: "private failure" }, 403));
  await assert.rejects(readPlayerProfile("7"), PlayerDataError);
});

test("directory preserves filters and distinguishes no matches from an outage", async () => {
  fixture(() => response([]));
  assert.deepEqual(await readPlayers({ search: "Fixture", position: "SG", era: "1990s" }), []);
  assert.equal(calls[0].searchParams.get("name"), "ilike.%Fixture%");
  assert.equal(calls[0].searchParams.get("position"), "eq.SG");
  assert.equal(calls[0].searchParams.get("era"), "eq.1990s");
  fixture(() => { throw new TypeError("fetch failed: private endpoint"); });
  await assert.rejects(readPlayers({}), { message: "Player data unavailable (unavailable)" });
  assert.equal(calls.length, 2);
});

test("missing or malformed configuration fails without fetching or leaking values", async () => {
  for (const url of [undefined, "private-invalid-value", "file:///private"]) {
    if (url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = url;
    await assert.rejects(readPlayers({}), { message: "Player data unavailable (configuration)" });
  }
  assert.equal(calls.length, 0);
});

test("one deadline covers serial stages and cancels concurrent reads", async () => {
  let aborted = 0;
  fixture((_url, init) => new Promise((_resolve, reject) => {
    const signal = init!.signal!;
    const cancel = () => { aborted++; reject(new DOMException("aborted", "AbortError")); };
    if (signal.aborted) cancel();
    else signal.addEventListener("abort", cancel, { once: true });
  }));
  const start = performance.now();
  await assert.rejects(withPlayerRead(async client => {
    await new Promise(resolve => setTimeout(resolve, 20));
    const results = await Promise.all([
      client.from("players").select().retry(false),
      client.from("player_seasons").select().retry(false),
    ]);
    for (const result of results) if (result.error) throw result.error;
  }, 50), { message: "Player data unavailable (timeout)" });
  assert.equal(aborted, 2);
  assert.ok(performance.now() - start < 500);
});


test("career panel shows six basic metrics and view controls without inventing missing values", () => {
  const html = renderToStaticMarkup(createElement(CareerStatsPanel, {
    playerId: 1,
    playerName: "Fixture Player",
    regular: { career_ppg: 30.1, career_rpg: null, career_fg_pct: 0.497 },
    playoffs: { summary: null, games: 0, seasons: 0, provisional: true },
    players: [{ id: 1, name: "Fixture Player" }, { id: 2, name: "Opponent", player_career_stats: null }],
  }));
  for (const label of ["Regular Season", "Playoffs", "Compare", "PPG", "RPG", "APG", "SPG", "BPG", "FG%"]) {
    assert.ok(html.includes(label), `missing ${label}`);
  }
  assert.ok(html.includes("30.1"));
  assert.ok(html.includes("49.7%"));
  assert.ok(html.includes("—")); // unknown RPG/other metrics are not zeros
  assert.ok(!html.includes("Verified playoff career summaries")); // not mislabeled as regular stats
});


test("selected NBA accolades total 61 and Olympic gold medals are separate", () => {
  const categories: Array<[string, number, string | null]> = [
    ["NBA MVP", 5, null], ["NBA Finals MVP", 6, null],
    ["NBA Defensive Player of the Year", 1, null],
    ["NBA Rookie of the Year", 1, null],
    ["All-NBA", 11, "First Team"],
    ["NBA All-Defensive Team", 9, "First Team"],
    ["NBA All-Star", 14, null], ["NBA All-Rookie Team", 1, "First Team"],
    ["NBA Scoring Champion", 10, null], ["NBA Steals Leader", 3, null],
  ];
  const rows: AccoladeRecord[] = categories.flatMap(([name, count, result]) =>
    Array.from({ length: count }, (_, i) => ({
      league: "NBA", accolade_name: name, season_year: 1980 + i,
      result, verification_status: "needs_fallback_cross_check",
    }))
  );
  rows.push(
    { league: "NBA", accolade_name: "NBA Champion", season_year: 1991 },
    { league: "NBA", accolade_name: "NBA All-Star Game MVP", season_year: 1988 },
    { league: "Olympics", accolade_name: "Olympic Gold Medal", season_year: 1984 },
    { league: "Olympics", accolade_name: "Olympic Gold Medal", season_year: 1992 },
  );
  // Duplicate importer record should never increase a career total.
  rows.push({ ...rows[0] });
  const result = summarizeAccolades(rows);
  assert.equal(result.nbaCount, 61);
  assert.equal(result.olympicMedals, 2);
  assert.equal(result.combinedCount, 63);
  assert.equal(result.provisional, true);
});

test("no award records means no verified zero-accolade claim", () => {
  assert.equal(summarizeAccolades([]).hasRecords, false);
});


test("legacy honors group NCAA, Olympic and other basketball awards apart from NBA totals", () => {
  const rows = [
    { id: 1, league: "NCAA", accolade_type: "college", accolade_name: "NCAA Champion", season_year: 1982 },
    { id: 2, league: "ACC", accolade_type: "college", accolade_name: "ACC Player of the Year", season_year: 1984 },
    { id: 3, league: "Olympics", accolade_type: "international", accolade_name: "Olympic Gold Medal", season_year: 1984 },
    { id: 4, league: "Naismith", accolade_type: "hall_of_fame", accolade_name: "Naismith Memorial Basketball Hall of Fame", season_year: 2009 },
    { id: 5, league: "NBA", accolade_type: "mvp", accolade_name: "NBA MVP", season_year: 1988 },
    { id: 6, league: "NBA", accolade_type: "championship", accolade_name: "NBA Champion", season_year: 1991 },
  ];
  const groups = groupLegacyHonors(rows);
  assert.deepEqual(groups.map(group => [group.title, group.records.length]), [
    ["College & NCAA", 2], ["Olympic & International", 1], ["Other Basketball Honors", 1],
  ]);
  assert.equal(summarizeAccolades(rows).nbaCount, 1);
  assert.equal(summarizeAccolades(rows).olympicMedals, 1);
  const deduped = groupLegacyHonors([...rows, { ...rows[0], id: 999 }]);
  assert.equal(deduped[0].records.length, 2);
});

test("profile provides collapsed legacy honors section with collegiate achievements", async () => {
  fixture(url => {
    if (url.pathname.endsWith("/players")) return response([{ id: 1, name: "Fixture Legend", position: "SG", era: "1980s" }]);
    if (url.pathname.endsWith("/player_career_stats")) return response([{ games_played: 10 }]);
    if (url.pathname.endsWith("/player_accolades")) return response([
      { id: 1, league: "NCAA", accolade_type: "college", accolade_name: "NCAA Champion", season_year: 1982 },
      { id: 2, league: "NBA", accolade_type: "mvp", accolade_name: "NBA MVP", season_year: 1988 },
    ]);
    return response([]);
  });
  const html = renderToStaticMarkup(await PlayerProfilePage({ params: Promise.resolve({ id: "1" }) }));
  assert.ok(html.includes("College &amp; Other Basketball Honors"));
  assert.ok(html.includes("<details>"));
  assert.ok(html.includes("NCAA Champion"));
  assert.ok(html.includes("NBA MVP"));
  assert.ok(html.includes("Recorded NBA individual accolades"));
});

test("Jordan playoff season totals produce historical per-game rates without inventing FG%", () => {
  const summary = summarizePlayoffSeasons([{
    season_year: 1991, stint_type: "team", games_played: 179,
    points_total: 5987, rebounds_total: 1152, assists_total: 1022,
    steals_total: 376, blocks_total: 158, verification_status: "single_source",
  }]);
  assert.equal(summary.games, 179);
  assert.equal(Number(Number(summary.summary?.career_ppg).toFixed(1)), 33.4);
  assert.equal(Number(Number(summary.summary?.career_rpg).toFixed(1)), 6.4);
  assert.equal(Number(Number(summary.summary?.career_apg).toFixed(1)), 5.7);
  assert.equal(Number(Number(summary.summary?.career_spg).toFixed(1)), 2.1);
  assert.equal(Number(Number(summary.summary?.career_bpg).toFixed(1)), 0.9);
  assert.equal(summary.summary?.career_fg_pct, null);
  assert.equal(summary.provisional, true);
});

test("playoff totals never double-count combined and team stint records", () => {
  const summary = summarizePlayoffSeasons([
    { season_year: 2000, stint_type: "team", games_played: 2,
      points_total: 10, rebounds_total: 4, assists_total: 3,
      steals_total: 1, blocks_total: 0 },
    { season_year: 2000, stint_type: "total", games_played: 3,
      points_total: 30, rebounds_total: 9, assists_total: 6,
      steals_total: 3, blocks_total: 1 },
    { season_year: 2001, stint_type: "team", games_played: 2,
      points_total: 20, rebounds_total: 10, assists_total: 8,
      steals_total: 2, blocks_total: null },
  ]);
  assert.equal(summary.games, 5);
  assert.equal(summary.summary?.career_ppg, 10);
  assert.equal(summary.summary?.career_rpg, 3.8);
  assert.equal(summary.summary?.career_bpg, null);
  assert.equal(summary.seasons, 2);
});
