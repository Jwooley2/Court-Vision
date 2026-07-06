# Court Vision Product Plan

## Product Vision

Court Vision is a basketball analytics and opinion platform built around player comparison, basketball history, and fan debate.

The long-term goal is to become a modern basketball comparison hub: part Basketball Reference, part StatMuse, part Letterboxd-style identity layer for basketball opinions.

Users should eventually be able to:

- Explore player profiles.
- Compare careers across eras.
- Build GOAT rankings.
- Create starting fives.
- Debate player resumes with transparent data.
- Use simulations and structured scoring to test basketball opinions.

Court Vision should not try to become a complete encyclopedia of every possible stat. It should show the most important player information needed for fair comparison, then link out to Basketball Reference / Sports Reference for deeper stat tables.

## Product Priorities

1. Functionality before polish.
2. Reliable player profiles before advanced social features.
3. Verified basketball data with source attribution.
4. Clean comparison flows for GOAT debates.
5. Jordan vs LeBron as the first flagship comparison.
6. Scalable data ingestion before adding many players.

## Core User Experience

A player profile should include:

- Basic identity: name, position, era.
- Career summary stats.
- Major accolades and accomplishments.
- Regular-season basic stats.
- Regular-season totals.
- Regular-season advanced comparison stats.
- Playoff basic stats.
- Playoff totals.
- Playoff advanced comparison stats.
- Clear source attribution.

The first major comparison feature should be a Jordan vs LeBron GOAT comparison page with:

- Career summary comparison.
- Regular-season comparison.
- Playoff comparison.
- Accolade comparison.
- Advanced stat comparison.
- Optional weighting logic later.

## Data Strategy

Basketball Reference / Sports Reference is the preferred source for:

- PER
- TS%
- USG%
- WS
- WS/48
- BPM
- VORP
- Season tables
- Playoff tables

Sports Reference / Basketball Reference data must be cited and linked when displayed.

CSV imports are acceptable for prototype validation, especially for Basketball Reference-specific advanced metrics. Long term, Court Vision should move toward API-based imports where possible.

Preferred long-term source hierarchy:

1. Basketball Reference / Sports Reference for source-specific historical and advanced metrics.
2. StatMuse for quick cross-checks and accessible summaries.
3. balldontlie API for API-based NBA data.
4. NBA API Library for official NBA-style data.
5. College Basketball Data API / SportsDataverse / HoopR for college basketball data.

## Current Verified Database State

Supabase project: Court Vision.

Current verified players:

- Michael Jordan
  - player_id: 1
  - external_id: michael_jordan
  - Jordan has complete regular-season and playoff data in player_seasons.
  - Jordan has basic stats, totals, advanced stats, and major accolades.

- LeBron James
  - player_id: 7
  - external_id: lebron_james
  - LeBron's ID is 7 because duplicate LeBron rows were inserted and deleted during setup. This is normal PostgreSQL sequence behavior and should not be manually corrected.
  - LeBron currently has a players row, but his full player_seasons data still needs to be imported.
  - LeBron's summary stats in players should be updated from current Basketball Reference data after import.

Important: database IDs are internal identifiers. Do not assume player IDs are sequential or meaningful. Use external_id for stable player identity.

## Current Technical State

Repository: Jwooley2/Court-Vision.

App folder: court-vision.

The app currently includes:

- Player listing page.
- Player profile page.
- Season stats table with Regular Season / Playoffs tabs.
- Basic / Advanced stat tabs.
- Basketball Reference CSV importer.

The importer currently supports:

- per_game
- totals
- advanced

The importer should eventually be upgraded to resolve players by external_id instead of requiring hardcoded player IDs.

## Current Build Goal

1. Finish LeBron data import using current Basketball Reference CSVs.
2. Update LeBron summary stats from imported data, not stale manual assumptions.
3. Build the Jordan vs LeBron GOAT comparison page.
4. Reduce manual SQL usage by improving importer scripts and data tooling.

## Data Integrity Rules

- Do not manually trust stale career summary stats.
- player_seasons should be treated as the source of truth for season-level data.
- players should be treated as the identity and summary layer.
- Avoid duplicate player rows.
- Use external_id for stable player identity.
- Cite Basketball Reference / Sports Reference when their data appears in the UI.

## Next Recommended Improvements

1. Add database uniqueness protection for players.external_id.
2. Upgrade importer command from --playerId to --playerExternalId.
3. Add a player sync script that creates or updates players safely.
4. Import LeBron regular-season and playoff CSVs.
5. Add Jordan vs LeBron comparison route.
6. Add comparison scoring logic after the raw comparison UI works.