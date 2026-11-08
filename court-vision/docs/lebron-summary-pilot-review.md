# LeBron James — Career-Summary Pilot: Source Review (STAGING ONLY)

_Reviewed 2026-11-08. Do not import to Supabase, publish as a verified profile, or use these values as a production snapshot._

## Current Court Vision database
- `players` identity row: ID 7, external_id `lebron_james`.
- `player_career_stats`: no completed row.
- `player_seasons`: 0 rows.
- `player_accolades`: 0 rows.

## Source priority
1. NBA official player and all-time-leaders tables (career GP, PTS, REB, AST, STL, BLK, FGM/FGA, playoff totals).
2. NBA API Library / `nba_api` and approved BALLDONTLIE NBA endpoints, with clear API provenance. Verify authorization and permissible usage before relying on the endpoints.
3. SportsDataverse hoopR historical cross-check; college basketball API only for applicable college profiles.
4. Independent public reference for discrepancies, never replacing the primary source silently.

## NBA reference snapshots observed
- NBA regular-season all-time leaders: https://www.nba.com/stats/alltime-leaders — the **live current-season** data changes after each game. Search-indexed versions differ:
  - 1,628 GP, 43,537 PTS in one crawled snapshot.
  - 1,629 GP, 43,550 PTS in another.
- NBA playoff all-time leaders: https://www.nba.com/stats/alltime-leaders?ActiveFlag=No&SeasonType=Playoffs — 302 GP, 8,521 PTS, 2,695 REB, 2,168 AST, 506 STL, 287 BLK, 3,055 FGM / 6,167 FGA in the available last postseason snapshot.
- Independent references differ in their *current regular-season cutoff*; don't combine data from multiple dates. A profile of an active player needs a frozen, explicitly timestamped season cutoff and update policy.

## Next Scout collection package
- Freeze career values at **end of 2025-26** for a stable initial comparison, or explicitly use the same captured 2026-27-as-of-date for every metric. Do not blend cutoffs.
- Gather NBA regular-season and playoff career totals and FGM/FGA for accurate career percentages.
- Confirm MVPs, Finals MVPs, championships, All-NBA, All-Defense, All-Star, rookie honors and scoring titles; count international/Olympic separately, plus separate legacy honors.
- Record source URL, retrieval time, season cutoff, independent cross-check, missingness and category-specific verification status per metric/award.
- Stage in a versioned reviewable file, not an import script. Prior importer can delete previously populated data (Issue #10).
- Only after a founder-approved write plan, verified backup and safe importer should the pilot be imported.

## Gate
No LeBron statistics have been modified or added to the production database. Jordan's draft PR #18 should be tested independently before merging. 
