# Preview test data

Issue #11, approved by the founder on November 6, 2026 after the proposed next task was explained.

## Decision and scope

The connected account has one Supabase project (production) and no development branches. Use a read-only synthetic fixture adapter for the current PR preview rather than copying production credentials or provisioning paid infrastructure. This is application QA, not validation of live Supabase grants, schema, source coverage or NBA statistics.

Enable only for Vercel Preview **and** `COURT_VISION_PREVIEW_FIXTURES=true`. Configure that single server-side flag for the `forge/player-data-resilience` Git branch only. Do not alter either production Supabase variable. In production, the fixture flag alone cannot switch the data path.

The adapter returns synthetic responses to the existing Supabase SDK's GET queries. It has no network or database connection, rejects non-GET requests and unexpected origins/tables, and keeps its example records in memory as immutable source fixtures. No API route or service credentials are added. A notice above all player routes identifies the preview as fictional test data.

## QA examples

- `Sample Guard`, ID 9001: career summary and one synthetic season.
- `Sample Forward`, ID 9002: identity with absent detail records, for incomplete-data states.
- Any other valid ID: confirmed absence; malformed IDs: no requests.
- Directory supports search, position and era filters and no-match results.

## Verification and limits

Thirteen credential-free tests pass, including fixture SDK reads/filtering, disabled fixture mode in production, rejected writes, safe errors, identity guards, unknown accolade rendering and deadline cancellation. ESLint and production build (including TypeScript) pass. Deployed commit `2c2b6ccc89578e133149fef06b8c85aaac96c970` is READY. Browser QA verified directory search, combined position/era filters, no-match results, summary/season rendering, missing playoff data, and incomplete profiles. Deployed HTTP reads returned 200 for IDs 9001/9002 and 404 for ID 9999 and malformed IDs. Do not infer live database correctness from synthetic tests.

Recovery verified: the existing branch preview was left on its missing-configuration error screen. After the fixture-enabled revision became READY and the branch alias advanced, clicking **Try again** recovered to the sample directory in the browser. This verifies recovery across a configuration repair; transient Supabase-outage recovery remains covered by local fixtures, not a live production outage injection.

Rollback: remove the branch-scoped fixture flag and/or revert this fixture commit. That preview will return a configuration error without real credentials; production variables and records remain unchanged. A future isolated database can replace fixtures once costs and data scope are approved. No merge or production release is authorized by this preview setup.

Known pre-existing UI issues observed during QA: player cards have poor contrast in light mode; null directory Hall of Fame values render as No and null award totals are blank. These are separate follow-up display issues; profile unknown accolade counts are correctly shown as dashes.
