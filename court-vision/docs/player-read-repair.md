# Player read repair — proposed review handoff

November 6, 2026. Related: Issue #8. Branch: `forge/player-data-resilience`.

## Problem and resulting behavior

When Supabase was unavailable, profiles waited for four sequential reads and then called the player missing. Restoring the existing project recovered public reads without an application release. This patch prevents the same misleading failure behavior and makes incomplete profiles explicit.

- Invalid IDs make no database requests. Confirmed absence invokes Next's not-found boundary.
- Configuration and failed reads throw sanitized error categories to a shared player-route error boundary. The public message never renders backend payloads; the retry control uses Next 16.2's `unstable_retry` API.
- Each render has one 8-second database-read budget. Identity is checked first; career, accolade and season reads then run concurrently. SDK retries are disabled to avoid extending the deadline. Timers are cleared and pending fetches cancelled when the operation finishes.
- Empty optional data is preserved. Empty accolades render dashes instead of zero totals, with incomplete-data notices. Counts from populated accolade lists are labeled as recorded counts, not guaranteed complete career totals.
- No statistics, schema, source choices, credentials or production settings change.

## Files

- `lib/supabase.ts`: lazy client configuration, request cancellation and sanitized errors.
- `lib/player-data.ts`: testable directory/profile read flows.
- Player directory/profile pages and season table: use read helpers and explain unavailable data.
- `app/players/error.tsx`, `app/players/[id]/not-found.tsx`: outage and absence boundaries.
- `lib/player-data.test.ts`, `package.json`: ten credential-free tests, run with `npm test`.
- `docs/mark-status.md`: current recovery and patch status, superseding older audit statements.

## Verification

Passed: `npm test` (10 tests), `npm run lint`, `npm run build` (including TypeScript), and final `npx tsc --noEmit`.

Tests cover invalid IDs/no network, absent identity/no downstream reads, sanitized identity/detail failures, concurrent details, missing optional data, rendered unknown accolade counts, directory filters/empty results/outages, missing/malformed configuration, and shared deadline cancellation. All requests use mocked fetch with an invalid fixture hostname; no real keys are needed.

A separately run local production server used a disposable localhost fixture API: directory and valid/incomplete profiles returned 200, invalid and absent profiles 404, and a simulated outage 500. Responses and server logs omitted the fixture's private error diagnostic. No live Supabase SQL or mutations were performed.

Browser interaction/visual QA could not run: Chromium failed to launch because the environment disallows its socket operation. Retry click behavior is therefore unverified. Verify the fallback and click **Try again** after restoring a test service before release.

## Limitations and rollout

- An 8-second read budget is an initial policy, not a production latency benchmark. Page rendering overhead is outside this budget.
- Next can commit status 200 before a later streamed error. Local 404/500 observations do not guarantee every streaming response has those statuses. No new status-enforcing proxy/API is introduced in this focused patch.
- No completeness metadata exists, so a nonempty partial accolade list can still omit honors. Its counts are explicitly qualified. Import provenance/completeness validation remains separate work.
- LeBron's detailed data remains missing. The historical product plan also says the import was unfinished; the live public profile corroborates the display gap but cannot prove why every individual field is missing.
- Founder approved branch publication and a draft PR after disclosure that this can trigger a Vercel preview. This handoff does not authorize a merge or production release. Preview configuration is tracked separately in #11.
- Proposed rollback: revert the patch commit; no database rollback is needed because no records change. Production release remains a separate founder decision after review.

## Next data task

Prepare a read-only source/coverage assessment using BALLDONTLIE, NBA API Library, and SportsDataverse/hoopR before standard search. Define a closed-season cutoff and distinguish NBA metrics from source-specific PER/WS/BPM/VORP. Prepare import validation, backup and rollback steps before requesting approval for any database writes. Do not run the existing delete-and-reinsert importer as part of this patch.
