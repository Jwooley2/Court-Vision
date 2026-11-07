import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { readPlayerProfile, readPlayers } from "./player-data";
import { PlayerDataError, withPlayerRead } from "./supabase";
import { renderToStaticMarkup } from "react-dom/server";
import PlayerProfilePage from "../app/players/[id]/page";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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
  // Every test replaces fetch; an unexpected network attempt fails closed.
  fixture(() => { throw new Error("Unexpected fixture request"); });
});

afterEach(() => {
  mock.restoreAll();
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
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

test("valid profile reads independent detail tables concurrently", async () => {
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
  assert.equal(profile?.seasons.length, 1);
  assert.equal(detailStarts, 3);
});

test("missing optional data stays missing rather than becoming zero", async () => {
  fixture(url => response(url.pathname.endsWith("/players") ? [{ id: 7 }] : []));
  const profile = await readPlayerProfile("7");
  assert.equal(profile?.careerStats, null);
  assert.deepEqual(profile?.accolades, []);
  assert.deepEqual(profile?.seasons, []);
});

test("incomplete profile renders unknown accolades, never fabricated zero totals", async () => {
  fixture(url => response(url.pathname.endsWith("/players") ? [{ id: 7, name: "Fixture Player" }] : []));
  const html = renderToStaticMarkup(await PlayerProfilePage({ params: Promise.resolve({ id: "7" }) }));
  assert.ok(html.includes("This profile is incomplete"));
  assert.ok(html.includes("Accolade data is not available"));
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
