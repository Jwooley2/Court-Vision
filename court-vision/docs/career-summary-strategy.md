# Court Vision — Approved Career-Summary-First Strategy

**Decision date:** 2026-11-07  
**Status:** Founder approved product direction; implementation and database changes are not yet deployed.

## Product identity
Court Vision is an opinion-led basketball comparison, customizable ranking, starting-five, and future simulation platform—not a comprehensive basketball-stat archive. Use StatMuse as UX inspiration, not as an assumed data feed or licensed content source. Link to established full-career statistical pages for deeper exploration.

## Three distinct layers
1. **Objective career statistics:** season-separated regular-season and playoffs career averages, totals, games/seasons played, shooting efficiency, and a small selected set of sourced advanced metrics (such as PER, TS%, WS, BPM, VORP). Preserve source, units, league, cutoff date, and missing-data status.
2. **Accomplishments:** titles, MVP, Finals MVP, DPOY, All-NBA, All-Defense, All-Star, scoring titles and other appropriately sourced honors. Preserve original award rows/years while rendering compact summary counts.
3. **Court Vision interpretation:** user-selected weights, editorial ratings, era context, peak/longevity and future simulations. Clearly distinguish these from observed statistics; no scoring algorithm or simulation formula is approved by this decision.

## Jordan: preserve, summarize, slim the read path
- **Never delete Jordan's existing player_seasons data, sourced CSVs, or awards as part of the MVP simplification.** Retain detailed records as an archive / potential later analysis source.
- Keep `players`, `player_career_stats`, `player_accolades`, and `player_seasons` as currently implemented until a separately reviewed schema plan is approved.
- Target profile UI: player identity; regular-season/playoffs switch; career averages, totals, efficiency, modest advanced metrics, major accolade highlights; source/coverage notices; links to verified external player pages.
- The current profile reader `court-vision/lib/player-data.ts` retrieves all `player_seasons` rows and the current profile page renders `SeasonStatsTable`. Forge should propose a minimal non-destructive change so ordinary profiles fetch only essential summary/accolade information. Preserve an opt-in/archived path to detailed data if needed; avoid breaking existing tests and directory reads.
- Validate values in Supabase against reliable sources before claiming Jordan's summary is complete. Existing documents describing historical database state are not proof of the current live database.

## New data pipeline
- **LeBron first, then 25 players/week as a research/validated-package target**; emphasize career summary, totals, accolades, provenance and coverage rather than full season-by-season ingestion.
- Existing season-level staged materials can be retained for verification and optional future modeling, but should not be required to publish a basic player profile.
- Evaluate BALLDONTLIE, NBA API, SportsDataverse/hoopR and College Basketball Data API for feasible legal/licensed collection before general searches. Basketball Reference-specific advanced metrics retain their source family; URLs are not permission to scrape or republish.
- Separate NBA/ABA/college and regular season/playoffs. Do not derive career per-game statistics by taking an unweighted average of yearly per-game figures; use correctly sourced/weighted aggregates.
- Preserve missing reasons and era coverage; a stat unavailable to Wilt must not count as zero in a LeBron comparison.

## Performance and cost assumptions
Reduced per-profile database reads and smaller displayed payloads may simplify UI and improve performance, but benchmark before making speed/cost claims. Summary data storage itself is usually small; simplifying collection and maintenance is a larger strategic advantage.

## Simulations
Career-only summaries are insufficient for realistic game simulations. Future separate compact simulation profiles may cover peak, career and late-career variants, style, role, efficiency, pace and defensive ability. Do not fabricate ratings or implement unapproved formulas.

## Guardrails / release sequence
1. Forge drafts a non-destructive implementation proposal and data-coverage checklist.
2. Validate a Jordan profile in isolated preview without new production reads/writes beyond normal read paths; preserve all historical records.
3. Bring LeBron to the same **summary** completeness standard.
4. Build the first Jordan vs LeBron side-by-side comparison with transparent coverage and era cautions.
5. Founder reviews PR, licensing, any schema migration, production data writes, and deployment separately.

**Hosting remains paused.** This decision does not authorize production import/delete, schema migration, merging to main, deployment, unpausing the website, spending, or a simulation formula.
