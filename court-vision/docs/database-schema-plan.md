# Court Vision Database Schema Plan

## Goal

Court Vision needs a database that can scale from a few manually entered players to thousands of players, seasons, teams, accolades, rankings, and simulations.

The current `players` table is useful for early development, but it should not become the final long-term structure.

## Core Principle

Separate the data into three layers:

1. **Raw data** — what happened.
2. **Court Vision ratings** — how we interpret what happened.
3. **User opinions** — what users rank, build, save, and debate.

## Core Tables

### players

Stores stable player identity.

Fields:
- id
- name
- slug
- primary_position
- secondary_position
- era
- birth_date
- height
- weight
- college
- country
- draft_year
- draft_pick
- hall_of_fame

### player_career_stats

Stores career totals and averages.

Fields:
- id
- player_id
- games_played
- seasons_played
- career_ppg
- career_rpg
- career_apg
- career_spg
- career_bpg
- career_fg_pct
- career_3p_pct
- career_ft_pct
- career_ts_pct
- career_per
- career_ws
- career_bpm
- career_vorp

### player_seasons

Stores individual season stats.

Fields:
- id
- player_id
- team_id
- season
- age
- games_played
- games_started
- minutes_per_game
- ppg
- rpg
- apg
- spg
- bpg
- fg_pct
- three_pct
- ft_pct
- ts_pct
- usage_pct
- per
- win_shares
- bpm
- vorp

### player_accolades

Stores awards and honors.

Fields:
- id
- player_id
- season
- accolade_type
- accolade_name
- placement

Examples:
- MVP
- Finals MVP
- All-Star
- All-NBA First Team
- All-Defense
- DPOY
- Rookie of the Year
- Scoring Champion

### teams

Stores franchise/team identity.

Fields:
- id
- name
- abbreviation
- city
- franchise
- primary_color
- secondary_color

### team_seasons

Stores team-season data.

Fields:
- id
- team_id
- season
- wins
- losses
- playoff_result
- offensive_rating
- defensive_rating
- net_rating
- pace

## Court Vision Interpretation Tables

### player_ratings

Stores Court Vision ratings used for rankings, comparisons, and simulations.

Fields:
- id
- player_id
- season
- offense_rating
- defense_rating
- playmaking_rating
- shooting_rating
- rebounding_rating
- longevity_rating
- peak_rating
- playoff_rating
- legacy_rating
- overall_rating

## User Opinion Tables

### profiles
### user_goat_picks
### user_rankings
### user_ranking_players
### user_starting_fives
### user_starting_five_players

## Simulation Tables

### custom_teams
### custom_team_players
### simulations
### simulation_outputs

## Near-Term Build Order

1. Keep the current `players` table working.
2. Create normalized planning docs.
3. Create `player_career_stats`.
4. Create `player_seasons`.
5. Create `player_accolades`.
6. Test small CSV import.
7. Update player profiles to pull from normalized tables.
8. Then scale up imports.