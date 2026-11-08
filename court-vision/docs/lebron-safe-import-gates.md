# LeBron James — Safe Import Gate (proposal only)
_Last reviewed: 2026-11-08. No SQL, database migration, or import approved._

## Scope and prerequisites
- LeBron exists as player ID **7** with external_id `lebron_james`, but currently has **no** career summary, season records, or accolade records.
- Source snapshots are frozen at **end of 2025–26**, not current 2026–27. Label the web profile with the cutoff until a deliberate update process exists.
- Files: `data/staging/lebron-james-through-2025-26.json` and `data/staging/lebron-james-honor-events-through-2025-26.json`.
- Current event file is **review-only**; each event needs independent verification of its year, tier, and source. A passing script test proves internal consistency, **not** historical correctness.
- No NCAA honors are appropriate for LeBron; notable high-school honors should be stored as separate legacy honors after review.
- Import must not follow the existing `scripts/import-bref-seasons.ts` path: that script uses `DELETE` followed by `INSERT` and could erase richer season history.

## Gate 1 — Source audit
- Cross-check all 2025–26 regular season and playoff totals against independent exports (NBA API/BALLDONTLIE and hoopR where permissions allow).
- Record source page and source **as-of date** per metric. The NBA player page shows active-season totals and is not itself a frozen 2025–26 snapshot.
- Award seasons, team tiers and medal years are cross-checked for all 65 records, backed by the NBA Sixers 2026-27 game notes, NBA 2003-04 season review and Cleveland All-Rookie release, NBA official all-defense and All-NBA historical lists, and USA Basketball history. Confirm the source citations/rights remain suitable before publication; do not confuse event-level cross-check with an approved import.
- Confirm the shared accolade category policy includes assists titles, but excludes championships from individual counts. NBA-only subtotal: 61. Olympics: 4 medals. These figures represent selected categories, not every basketball honor.
- Do not mark a category/event `cross_checked` merely because a totals validator passed.

## Gate 2 — Technical mapping and dry run
- Read schema constraints and RLS policies before authoring SQL. Map the **career aggregate** to `player_career_stats`, and **dated honors** to `player_accolades` only after each row is verified.
- **Founder confirmed career-summary-first scope**: regular-season and playoff CAREER summaries only, plus honors. Do **not** collect or import LeBron's 23 season-by-season rows as a prerequisite. Existing Jordan historical season data may be retained but is not the target profile read path.\n- **Exact production schema review (Nov 8):** `player_career_stats` has `UNIQUE(player_id)` and cannot hold both regular-season and playoff records for the same player. Implement a small, distinct `player_playoff_career_stats` table (or another explicitly reviewed period-aware structure) holding 302 playoff games and sourced totals/averages. This needs a separately approved schema migration.\n- **Exact production accolade schema review:** only `PRIMARY KEY(id)` exists, **no unique event key** on `(player_id,league,accolade_name,season_year,result)`. The disposable rehearsal uses stronger constraints than production and therefore does not prove real-table idempotency. Add a reviewed unique natural-key expression/index or use a guarded deterministic conflict check in one transaction, after inspecting duplicate/null semantics and backup.\n- Existing playoff panel calculates from season totals. Refactor to prefer a sourced playoff CAREER summary and use legacy season totals as fallback for Jordan. Never manufacture season rows from the career summary.
- Existing playoff tab derives averages from season totals. Until LeBron's season-level rows are available, it needs an explicit, separately sourced career-level read path; otherwise show unknown rather than borrowing regular-season stats.
- Run deterministic offline validation and a read-only dry-run diff listing every planned insert/update; require zero deletes and zero changes to Jordan.
- Use a staging DB or isolated transaction rehearsal, with exact row counts and computed totals documented.

## Gate 3 — Founder-approved write plan
- Request a **new explicit founder approval** before any production Supabase write, import, schema change, or deployment.
- Take and verify a restorable database snapshot / scoped export of `players`, `player_career_stats`, `player_accolades`, `player_seasons`, and related provenance records before the write.
- Implement **idempotent, transactional** upserts on clear natural keys with conflict handling and an abort on unexpected existing records. Do not delete and reinsert rows. Never apply SQL that overwrites an unrelated player.
- After writing, read back rows and verify counts, sources, cutoff, percentages, awards and no foreign-key mismatches. Keep a rollback script/snapshot plan with a tested isolated rehearsal, then separately approve release.

## Gate 4 — Presentation and release
- Review parity with Jordan, explicit cutoff labels, missing-stat indicators, and separate College/International/Other honors.
- Ensure staging PR #19 and Jordan profile PR #18 do not conflict. Run CI and real browser interactions before merge or Vercel unpause.
- Release only after Mark presents the diff and receives founder approval.

## Current state
**No production import is authorized or executed.** PR #19 is strictly a staged data/artifact review.

## Scope confirmation from founder (Nov 8, 2026)

The agreed product is **career summaries, not season-stat ingestion**. The final import scope is 1 regular-season career record, 1 playoff career record (requiring an approved schema/read path), 65 staged honors, **0 season-by-season records**, and **0 deletions**. The original 1+65 disposable transaction rehearsal covers only the already existing career/accolade tables; a revised rehearsal must cover the playoff summary table and exact accolade constraints before production approval.
