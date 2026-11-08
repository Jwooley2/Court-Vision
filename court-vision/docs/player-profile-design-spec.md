# Universal NBA GOAT Player Profile — UI and Counting Specification

**Founder direction:** 2026-11-07. **Reference:** user-provided Michael Jordan profile mockup in the project conversation (image not committed to repository). This specification supplements `career-summary-strategy.md` and Forge implementation issue #16.

## Layout and content

### 1. Dark player header
- Headshot; player name; historically appropriate principal team or relevant team designation; jersey number(s) with context; position; NBA seasons played; NBA championship count.
- Reference mockup: black/dark charcoal header, large high-contrast name, team/number upper label, compact metadata lower line, left portrait. Do not imply a player only played for one franchise when multiple teams matter; allow team and jersey variants.
- Use a licensed/headshot image with fallback placeholder, accessible alt text and mobile stacking.

### 2. Individual accolades
- Two-column list on desktop, single column on mobile. Each entry shows **count × clear award type**, with optional team placement detail.
- Categories: MVP, Finals MVP, DPOY, Rookie of the Year, All-NBA, All-Defensive, All-Star, All-Rookie, scoring titles, and statistical category titles (such as steals leader).
- Display zero only if that category is verified to be completely tracked; otherwise show unavailable/partial indicator. No source ambiguity or double counting.
- Distinguish league/season and official selection versus award. All-NBA first-team selection is a subset of All-NBA selections, not an additional accolade; same for All-Defense.

### 3. Prominent total individual accolades
- Sum the displayed **non-overlapping, countable** award/selection/title entries; exclude NBA championships (team success) from the total.
- Michael Jordan mockup example: MVP 5 + Finals MVP 6 + DPOY 1 + ROY 1 + All-NBA 11 + All-Defensive 9 + All-Star 14 + All-Rookie First Team 1 + scoring titles 10 + steals titles 3 = **61**.
- **The 61 is the defined mockup sum, not a promise that the selection universe captures all honors.** Future new categories must have consistent inclusion rules across all profiles. Count each award event once; first-team breakdowns are explanatory subsets, and titles must not overlap with duplicated statistical-title records.
- Only present a definitive total for complete verified categories. If not verified, label it `Recorded accolades`, `At least N`, or `Incomplete` instead of misleading precision.
- Exclude team championships, Hall of Fame inductions, NBA anniversary teams, Olympic/college honors, and skill-contest victories from the standard **NBA individual accolade score** unless founder later approves a different category policy. They may be shown elsewhere without silently changing the total. If statistical leadership scope changes (points/steals/assists/rebounds/blocks etc.), apply it consistently and revalidate historical years.

### 4. One shared statistics display
- Tab/segmented control: **Regular Season | Playoffs | Compare**.
- For regular season and playoffs: show PPG, RPG, APG, SPG, BPG, FG% as the first six prominent averages, in this order, in the same panel. Use career summary figures for the selected season type, with correct league scope and source attribution.
- Support secondary career totals, efficiency and selected advanced statistics below the core six without bloating the hero panel.
- Compare replaces the panel with a player-picker + head-to-head view using those six stats first, then optional totals/accolades; do **not** invent comparison weights or declare a GOAT winner.
- Preserve a visible regular-season/playoff context inside Compare (both players must share the same season type), and show shared-availability indicators across eras.
- Handle missing steals/blocks for older eras explicitly; never interpret missing as zero. Avoid calculating career averages by averaging season per-game values unweighted.
- Maintain state within shared area rather than routing away from the profile merely to switch statistics modes.

## Engineering acceptance criteria for Forge
1. Match the broad visual hierarchy of the supplied mockup while making a responsive, accessible, reusable player-profile component.
2. Implement/verify the exact 61 Jordan mockup breakdown from deduplicated, correctly classified accolade rows; flag any discrepancies before shipping.
3. Shared Regular Season / Playoffs / Compare panel uses consistent six-stat ordering and player identity, with transparent regular-season vs playoff sources/availability.
4. Preserve all historical Jordan `player_seasons` and CSV data. Ordinary profile read should not fetch all season detail; no destructive database change.
5. Keep the site paused. Use preview/fixture data where required. No merge, deployment, production data update, pricing change or scoring formula without the separately required review.
6. Record source/license considerations for player headshots; do not copy image or StatMuse assets without reuse permission.

## Questions intentionally left for later
- Whether Compare defaults to regular-season or playoffs and whether users may select additional metrics can be refined during the initial UI build.
- How to score/play out simulations is not established by this design specification.
