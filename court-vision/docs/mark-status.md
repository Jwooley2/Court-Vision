# Court Vision — Mark's Project Status

_Last reviewed: 2026-11-06. This is a planning and coordination record, not a claim that any agent is running continuously._

## Latest verified milestone — November 6, 2026

This section supersedes older audit/startup status statements below.

- Supabase project `hflvhyzewmdvlfqzonbk` now reports `ACTIVE_HEALTHY` after the approved resume.
- Public production directory renders Jordan and LeBron. Jordan's profile renders career stats, seasons and accolades. LeBron's profile renders identity but lacks detailed data. No rebuild or application deployment was needed to recover these reads.
- Active engineering goal: Issue #8 player-read resilience. Founder approved proceeding in conversation after service recovery.
- Local branch `forge/player-data-resilience` contains a proposed patch: request-scoped 8-second read deadline, safe configuration/error categories, validated profile IDs, early identity guard, parallel detail reads, error and not-found boundaries, and explicit incomplete-data messaging.
- Verification: 10 credential-free fixture/render tests; ESLint; production build including TypeScript; local production HTTP renders using a disposable fixture service (valid/incomplete 200, invalid/absent 404, outage 500, no raw backend diagnostic). No production keys or database writes were used.
- Browser automation could not launch due to environment socket restrictions. Retry button interaction and visual review remain unverified. Next streaming may commit HTTP 200 before a later error; observed local statuses do not guarantee all streaming responses have 404/500.
- Founder approved publishing the tested branch and opening a draft PR after being told branch publication may trigger a Vercel preview. Publication is the current handoff; no merge or production deployment is authorized. Preview configuration remains separate work in #11.
- LeBron data import remains pending source verification, a concrete backup/rollback plan, and approval for the specific data changes. This patch does not supply or overwrite statistics.

## Mission
Build a trustworthy basketball analytics and opinion platform: objective player information, comparisons, user GOAT rankings, starting fives, and eventually user-driven simulations. Prioritize functionality and verified data.

## Ownership and workflow
- **Product director:** human founder. Determines basketball philosophy, feature priorities, spending, and production releases.
- **Project manager:** Mark (conversational role in the AI for $ ChatGPT project; repo instruction set in /AGENTS.md).
- **Engineering execution:** Forge is the configured coding-specialist role; an explicitly started ChatGPT Work/Codex task or connected development workflow is still required for independent execution. No continuous coding worker is currently running.
- **Source of truth:** GitHub code, issues, pull requests, this status file, and approved product/architecture docs.
- **Scheduled reporting:** Mark reports weekly Monday mornings (America/Chicago). Scout independently researches and reports weekly Thursday mornings; its GitHub handoff is issue #3 when tools permit. Neither recurrence initiates autonomous coding.

## Verified status
- GitHub repository: Jwooley2/Court-Vision, default branch main.
- Next.js application: court-vision/; its package.json lists Next.js, React, TypeScript, Supabase integration, and a Basketball Reference CSV import script.
- Historical product plan: court-vision/docs/product-plan.md; architecture decisions: court-vision/docs/architecture-decisions.md.
- The July plan describes player profiles and normalized stats with Jordan data, and identifies unfinished LeBron data and comparison work. **These database claims have not yet been reverified against the live Supabase database.**
- The importer script currently deletes matching season rows and reinserts them for per-game imports. This must not be run on production without explicit approval, backup, and verification.
- Vercel `court-vision` is connected to this GitHub repository, uses Next.js, and shows a READY production deployment at the Scout setup merge commit on 2026-11-06. Its project reports SSO protection enabled and `live=false`; public accessibility has **not** been verified. Some recent branch preview deployments are in ERROR state, which needs diagnosis.
- Build, lint, tests, public accessibility, live Supabase contents, and external data licensing are **not yet audited**.

## Current focus (P0)
Read-only revival audit; verify what actually works, what is incomplete, and whether to preserve/refactor/rebuild.

## Workflow board
| Item | State | Evidence / next step |
| --- | --- | --- |
| Define Mark's standing instructions | Merged | https://github.com/Jwooley2/Court-Vision/pull/1 — merged November 6, 2026 |
| Independent revival audit | GitHub issue #2, not started | Investigate code and produce court-vision/docs/revival-audit.md without production changes |
| LeBron data import | Planned (historical) | Validate DB state and safe import strategy before executing |
| Jordan vs. LeBron comparison | Planned (historical) | Build after integrity of comparison data is confirmed |
| User rankings, starting fives, simulations | Future | Require product scoping after basic comparison experience |
| Forge coding-specialist setup | Draft PR | New coding role and read-only audit handoff; not a running autonomous worker |
| ChatGPT Sites feasibility | Read-only assessment pending | Evaluate Next.js, Supabase, auth, preview/release and long-run costs vs Vercel, without migration |

## Research / opportunity feed
- Scout charter: `court-vision/docs/scout-research-charter.md` (merged in PR #4 on November 6, 2026).
- Research inbox: https://github.com/Jwooley2/Court-Vision/issues/3.
- Research task: “Scout’s Court Vision Brief,” weekly Thursday morning, first scheduled for November 12, 2026. Future runs and GitHub commenting depend on connector availability.
- Mark reviews credible Scout suggestions when prioritizing engineering work, without automatic acceptance.

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
