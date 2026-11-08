# LeBron accolades follow-up audit — 2026-11-08

## Why the profile showed zero championships
The first 2025–26 LeBron import staged only 61 selected NBA individual award events and 4 Olympic medals. It deliberately excluded team championships from the individual tally, but the display derives the separate **Championships** highlight from dated `NBA Champion` accolade events. The player header's `championships=4` was correct, but those 4 records were missing.

## Implemented (production, guarded transaction)
Inserted 12 verified events for LeBron, player ID 7, without updating or deleting any existing player, stats, or award record.

- 4 × `NBA Champion` — 2012 Miami Heat; 2013 Miami Heat; 2016 Cleveland Cavaliers; 2020 Los Angeles Lakers (new rows 163–166).
- 3 × `NBA All-Star Game MVP` — 2006, 2008, 2018 (new rows 167–169).
- 2023 NBA In-Season Tournament / 2023–24 NBA Cup champion, MVP, and All-Tournament Team (new rows 170–172; season_year 2024 follows our season-ending-year convention).
- NBA 75th Anniversary Team, announced October 2021 (new row 173).
- 2024 Paris Olympic men's basketball tournament MVP (new row 174).

Sources include NBA.com player biography, NBA Finals history, NBA official NBA Cup All-Tournament Team release, NBA 75 official announcement, and NBA.com Olympic MVP article. All records include both source URLs.

**Now:** 77 dated LeBron events total = 61 *selected NBA individual honors* + 4 Olympic medals + 4 NBA championships + 8 secondary international/NBA accomplishments. Championship counts are **not** added to the 61 individual tally. The 4 Olympic medals are the only medals in the Olympic subtotal; Olympic tournament MVP is distinct.

## Post-import checks
- Live `/players/7` HTTP 200 shows **Championships: 4**, Finals MVPs: 4, MVPs: 4, and 61 selected NBA individual awards.
- NBA details and separate College/Other Basketball Honors include the new dated events.
- `/players/1` HTTP 200 still displays Jordan's 6 championships, 6 Finals MVPs, 5 MVPs.
- No schema migration, code change, or Vercel deployment needed.

## Important recovery addendum
Existing `lebron-import-rollback-only.sql` was prepared *before* this follow-up and deliberately requires exactly **65** LeBron honors. It will **refuse to run** now that there are 77, by design. Before attempting to reverse the **original** LeBron import, first separately reverse ONLY the 12 addendum events (IDs **163–174**) after verifying player ID 7, row years/names, and a total of 77 awards. Then re-check that exactly 65 original awards remain and only then review the original guarded rollback.

For these 12 new records the precise compensating removal (not run) is:

```sql
BEGIN;
DO $$
BEGIN
 IF (SELECT count(*) FROM public.player_accolades WHERE player_id=7) <> 77
 OR (SELECT count(*) FROM public.player_accolades WHERE player_id=7 AND id BETWEEN 163 AND 174) <> 12
 THEN RAISE EXCEPTION 'Honor snapshot changed; do not delete'; END IF;
END $$;
DELETE FROM public.player_accolades WHERE player_id=7 AND id BETWEEN 163 AND 174;
DO $$
BEGIN
 IF (SELECT count(*) FROM public.player_accolades WHERE player_id=7) <> 65
 THEN RAISE EXCEPTION 'Rollback count mismatch'; END IF;
END $$;
COMMIT;
```

This is an exact-ID compensating operation, **not a full database backup**. It must never be executed automatically.
