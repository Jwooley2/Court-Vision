# Court Vision — Mark's Project Status

_Last reviewed: 2026-11-06. This is a planning and coordination record, not a claim that any agent is running continuously._

## Mission
Build a trustworthy basketball analytics and opinion platform: objective player information, comparisons, user GOAT rankings, starting fives, and eventually user-driven simulations. Prioritize functionality and verified data.

## Ownership and workflow
- **Product director:** human founder. Determines basketball philosophy, feature priorities, spending, and production releases.
- **Project manager:** Mark (conversational role in the AI for $ ChatGPT project; repo instruction set in /AGENTS.md).
- **Engineering execution:** use connected GitHub tools for scoped tasks or an explicitly started coding task in Codex/Work. No coding worker is currently represented as running.
- **Source of truth:** GitHub code, issues, pull requests, this status file, and approved product/architecture docs.

## Verified status
- GitHub repository: Jwooley2/Court-Vision, default branch main.
- Next.js application: court-vision/; its package.json lists Next.js, React, TypeScript, Supabase integration, and a Basketball Reference CSV import script.
- Historical product plan: court-vision/docs/product-plan.md; architecture decisions: court-vision/docs/architecture-decisions.md.
- The July plan describes player profiles and normalized stats with Jordan data, and identifies unfinished LeBron data and comparison work. **These database claims have not yet been reverified against the live Supabase database.**
- The importer script currently deletes matching season rows and reinserts them for per-game imports. This must not be run on production without explicit approval, backup, and verification.
- Build, lint, tests, deployment state, live Supabase contents, and external data licensing are **not yet audited**.

## Current focus (P0)
Read-only revival audit; verify what actually works, what is incomplete, and whether to preserve/refactor/rebuild.

## Workflow board
| Item | State | Evidence / next step |
| --- | --- | --- |
| Define Mark's standing instructions | Draft PR | https://github.com/Jwooley2/Court-Vision/pull/1 — awaiting owner review and merge |
| Independent revival audit | Not started | Investigate code and produce court-vision/docs/revival-audit.md without production changes |
| LeBron data import | Planned (historical) | Validate DB state and safe import strategy before executing |
| Jordan vs. LeBron comparison | Planned (historical) | Build after integrity of comparison data is confirmed |
| User rankings, starting fives, simulations | Future | Require product scoping after basic comparison experience |

## Decisions requiring approval
- Any production data import, deletion, migration, or deployment.
- Any new paid API, subscription, or infrastructure spend.
- Any substantial change to user-visible simulation formulas, weighting, or editorial ratings.
- Any decision to discard the current application and rebuild.

## Standard update from Mark
1. **Focus** — one sentence.
2. **Done** — verified progress.
3. **Waiting / blocked** — what is needed.
4. **Your decision** — short options, or 'none'.
5. **Next** — what Mark recommends.

Update this file after material verified milestones. Never silently mark planned work as complete.
