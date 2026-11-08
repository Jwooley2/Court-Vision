# Court Vision — player stories editorial standard

Every published Court Vision player earns a **distinct, respectful, memorable mini-biography**. This rule applies to role players, current players, journeymen, and overlooked contributors—not just all-time greats.

## Editorial contract
- **Three to four punchy sentences**, usually 55–100 words.
- Anchor in **at least one verified personal detail**: upbringing, unlikely opportunity, playing style, perseverance, leadership, late-career resurgence, or enduring cultural impact.
- Celebrate **what makes this player uniquely worth watching or remembering**, not just awards and statistics. Different careers require different angles; do not turn every write-up into a fake GOAT pitch.
- Specific, warm and vivid language; clever nicknames only when they are widely documented. Never invent a nickname, childhood hardship, injury, quotation, inner motive, private experience, or achievement.
- Complementary does not mean inaccurate. Don't exaggerate objectively disputed claims into facts. The Jordan user-provided varsity example refers specifically to not making the **varsity team as a sophomore**, not getting dismissed from all high-school basketball.
- Use original text, not scraped sports-column copy. Keep **source notes** and a reviewed flag for editors; separate factual claims from literary license.
- **Require biography review before marking a newly collected player profile ready for publication.** Scaffold with an explicit “story awaiting editorial review” message if no approved bio exists; never generate fake personal history dynamically.
- Approved narratives live in `lib/player-bios.ts` keyed by `external_id`. For scale, migrate to a dedicated `player_editorial` table or CMS with revision provenance, review status, and editorial approval workflow before importing large weekly batches; do not make new player rows depend on one deployment per story indefinitely.

## Initial profiles
- Michael Jordan: founder-supplied original text (verbatim), sophomore varsity setback, competitive intensity, six titles, six Finals MVPs.
- LeBron James: original narrative focused on Akron, enormous expectations, playmaking and longevity, four NBA titles and four MVPs.

## Comparison feature
- `/compare?left=1&right=7` fetches real profile career summaries and award events, offers category and metric selection, can hide equal values, and refuses to create a unilateral GOAT score.
- Omitted statistics are shown as em dashes, not zero. Championship team achievement is separated from NBA individual awards. 2025-26 cutoff displayed for LeBron.
- Current implementation performs **two player-profile reads only** and provides two selection dropdowns. It does not fetch every profile's award history when the catalog expands.
- Future enhancements: saved preference sets, richer historical context and era caveats, and playoff shooting TS% once verified; none should secretly impose preferred weights.

## Launch gates
1. Every published player has a factual approved story.
2. Source-year cutoff is visible and consistent across columns.
3. Mobile layout and browser interaction smoke tests pass (dropdown navigation, checkboxes, reset, equal-value filter).
4. Missing fields never render as 0; no user-facing numerical winner inferred.
