# LeBron production import — execution and verification

**Date:** 2026-11-08  
**Project:** Court Vision / Supabase `hflvhyzewmdvlfqzonbk`  
**Cutoff:** end of 2025–26 season; excludes 2026–27

## Executed
- Applied additive migration `create_player_playoff_career_stats`: new playoff career summary table, public SELECT-only RLS policy. No existing table replaced.
- One guarded production SQL transaction:
  - Prechecked player ID 7 and original season/average fields.
  - Required LeBron to have zero career, playoff, honor, and season rows before proceeding.
  - Inserted **1 regular career summary** (ID **2**) based on 1,622 games and 43,440 points.
  - Inserted **1 playoff career summary** (ID **1**) based on 302 games and 8,521 points.
  - Inserted **65 honor rows** (IDs **98–162**, inclusive): 61 selected NBA individual awards and 4 Olympic medals.
  - Updated only LeBron's basic player-list career averages and seasons played (21 to 23).
  - Verified all expected counts *within the transaction* before commit; Jordan's baseline stayed at 1 career row and 97 honors; zero LeBron season rows added.
- Independently read back 26.8 PPG regular, 28.2 PPG playoffs, 50.7% regular FG, 49.5% playoff FG, 23 seasons, 61 NBA honors, 4 Olympic medals.
- Enabled `COURT_VISION_PLAYOFF_SUMMARIES_ENABLED=true` for **preview branch only** (`forge/playoff-career-summary-storage`); production flag remains untouched.
- Verified preview HTTP 200: /players, /players/7, and /players/1. Client payload contains LeBron playoff summary and cutoff. New preview did not log any observed errors.

**Preview:** https://court-vision-dfxnjr77d-jwbuildit.vercel.app/players/7

## Recovery and caveats
- `lebron-production-preimage-2026-11-08.json` records the original affected player fields and zero starting rows.
- `lebron-import-rollback-only.sql` is a guarded, exact-ID compensating rollback for this import. It has **not been executed**.
- Supabase is currently on its **Free plan**. No automatic full-instance database backup was confirmed; this scoped recovery record is **not** a substitute for a full recoverable backup. Future wider migrations should require an offsite full database dump or paid backups.
- Original draft staging JSON files remain `allow_production_import:false` to prevent accidental repeated generic imports. This import was a separately guarded founder-authorized operation, not a generic script.
- No PR merged and no production Vercel deployment performed. Scout's periodic data refresh remains separate.
