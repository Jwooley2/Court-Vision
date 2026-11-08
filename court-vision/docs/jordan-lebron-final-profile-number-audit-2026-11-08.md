# Jordan / LeBron — Final player-card numerical audit

**Audit date:** 2026-11-08  
**Comparison cutoff:** Michael Jordan's full retired career; LeBron James **through 2025-26**, intentionally excludes 2026-27.  
**Scope:** The metrics and award categories visible in Court Vision's current profile, not every advanced statistic or every historically obtainable honor.

## Regular season

| Displayed measure | Michael Jordan | LeBron James (through 2025-26) |
|---|---:|---:|
| Seasons | 15 | 23 |
| Games | 1,072 | 1,622 |
| Points | 32,292 | 43,440 |
| Rebounds | 6,672 | 12,095 |
| Assists | 5,633 | 12,016 |
| Steals | 2,514 | 2,417 |
| Blocks | 893 | 1,185 |
| PPG | 30.1 | 26.8 |
| RPG | 6.2 | 7.5 |
| APG | 5.3 | 7.4 |
| SPG | 2.3 | 1.5 |
| BPG | 0.8 | 0.7 |
| FG% | 49.7% | 50.7% |
| 3PT% | 32.7% | 34.8% |
| FT% | 83.5% | 73.7% |
| TS% | 56.9% | 59.0% |

Cross-check: Basketball Reference individual pages and head-to-head career totals; NBA.com official Jordan profile and career leaders (and its 2025-26 LeBron season-end article). Basketball Reference records LeBron at 61,030 regular-season minutes through 2025-26, while NBA.com lists 61,029; **minutes are not a displayed card metric** and should retain source provenance rather than be treated as exact agreement.

## NBA playoffs

| Measure | Michael Jordan | LeBron James |
|---|---:|---:|
| Postseason appearances | 13 | **19** |
| Playoff games | 179 | 302 |
| Playoff points | 5,987 | 8,521 |
| Rebounds | 1,152 | 2,695 |
| Assists | 1,022 | 2,168 |
| Steals | 376 | 506 |
| Blocks | 158 | 287 |
| PPG | 33.4 | 28.2 |
| RPG | 6.4 | 8.9 |
| APG | 5.7 | 7.2 |
| SPG | 2.1 | 1.7 |
| BPG | 0.9 | 1.0 |
| FG% | 48.7% | 49.5% |

NBA.com all-time playoff leaders and Basketball Reference both agree on games, points, all five box score component totals, and FGM/FGA.

**Corrections applied to Supabase in a guarded transaction:**
1. LeBron postseason appearances **18 → 19** (confirmed specifically by NBA.com's April 13, 2026 article about his *19th* playoff run).
2. Added a dedicated Jordan `player_playoff_career_stats` row for his 179 games, 5,987 points, 1,152 rebounds, 1,022 assists, 376 steals, 158 blocks, 2,188 made / 4,497 attempted field goals, 13 postseasons; `verification_status=cross_checked`, `source_cutoff=1997-98`. The previous source season rows are preserved unchanged.

## Selected awards (Court Vision policy)

| Award | Jordan | LeBron |
|---|---:|---:|
| NBA titles (team honor; separate) | 6 | 4 |
| NBA regular MVP | 5 | 4 |
| Finals MVP | 6 | 4 |
| Defensive Player of Year | 1 | 0 |
| Rookie of Year | 1 | 1 |
| All-NBA | 11 (10 first, 1 second) | 21 (13 first, 4 second, 4 third) |
| All-Defense | 9 first | 6 (5 first, 1 second) |
| All-Star | 14 | 22 |
| All-Rookie | 1 | 1 |
| Scoring titles | 10 | 1 |
| Steals titles | 3 | 0 |
| Assists titles | 0 | 1 |
| **Selected NBA individual honors** | **61** | **61** |
| Olympic medals | 2 gold | 3 gold + 1 bronze |

Both selected-NBA totals are 61 under **this product's defined category policy**, not a claim that every individual achievement ever is counted. Team championships and additional All-Star Game MVP / NBA Cup / college / HOF / international accomplishments are separated. NBA.com Jordan legends / award press release, USA Basketball career achievements, NBA.com LeBron official awards listing, and NBA.com All-NBA selection history corroborate the main categories.

**Hall of Fame disambiguation (data correction):** Jordan's separate 2010 record now clearly says **1992 United States Olympic Team Hall of Fame Induction**, distinct from **Michael Jordan's individual 2009 induction**; this is verified with the Naismith Memorial Basketball Hall of Fame's official pages. Counts remain unchanged.

**NBA Cup year convention:** LeBron's first NBA Cup, MVP, and All-Tournament team were awarded in **December 2023**, during the **2023-24 NBA season**; database season_year=2024 is the *season-ending year* and season_label='2023-24'. This is intentionally not a claim the December tournament occurred in calendar 2024. Source NBA.com's Dec 11, 2023 official release.

## Remaining limitations

- **LeBron is active**: the card is accurately labeled and source-frozen through 2025-26, not an automatically updated 2026-27 card. Next ingestion should update his regular-season totals and number of seasons when new full-season data is available.
- NBA.com and Basketball Reference use occasionally different accumulated **minutes** (one-minute difference in LeBron's 2025-26 regular-season history); minutes are not shown.
- Jordan's main career stats row retains its historic `needs_fallback_cross_check` status because its **hidden** PER, Win Shares, BPM, and VORP columns were not audited and are outside Court Vision's UI scope. The **displayed** career averages and percentages were checked independently.
- Secondary/college/international honor lists were not guaranteed exhaustive. The core selected award categories and trophy counts were compared, but the site should not claim a complete accounting of every award in league history.
- The application still requires a client-side browser interaction check of the Playoffs and Compare tabs beyond SSR/HTTP checks. A passing Next.js build and HTTP 200 do not prove all user interactions.
- No season-by-season data import is required for the product direction. No main-branch merge or production Vercel deployment was authorized.

## Primary sources used

- https://www.basketball-reference.com/players/j/jordami01.html
- https://www.basketball-reference.com/players/j/jamesle01.html
- https://www.sports-reference.com/stathead/basketball/vs/lebron-james-vs-michael-jordan
- https://www.nba.com/stats/alltime-leaders?ActiveFlag=No&SeasonType=Playoffs
- https://www.nba.com/stats/alltime-leaders?PerMode=Totals&SeasonType=Regular+Season&StatCategory=PTS
- https://www.nba.com/news/19-playoff-stats-lebron-james-2026-playoffs
- https://www.nba.com/news/history-nba-legend-michael-jordan
- https://pr.nba.com/nba-unveils-the-michael-jordan-trophy-to-be-awarded-to-the-kia-nba-most-valuable-player
- https://www.nba.com/news/players-with-most-all-nba-selections-ever
- https://www.nba.com/news/in-season-tournament-all-tournament-team-2023
- https://www.usab.com/players/michael-jordan
- https://www.hoophall.com/hall-of-famers/michael-jordan
- https://www.hoophall.com/hall-of-famers/1992-united-states-olympic-team
