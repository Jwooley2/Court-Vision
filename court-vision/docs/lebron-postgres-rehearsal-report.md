# LeBron Import — Disposable PostgreSQL Rehearsal Report
_Date: 2026-11-08_

## Result: PASS in isolated PostgreSQL 16

Run: https://github.com/Jwooley2/Court-Vision/actions/runs/42459750861

The GitHub workflow launches its own disposable `postgres:16` Docker container. It does not load production Supabase URLs, credentials, or data, nor does it purchase a Supabase development branch.

Rehearsed from the proposed 2025-26 source snapshot and 65 dated honors:

| Scenario | Expected behavior | Observed |
|---|---|---|
| Baseline backup | `pg_dump -Fc` generates a nonempty restorable backup | Pass |
| Explicit transaction rollback | Two proposed import attempts within `BEGIN ... ROLLBACK` leave zero imported rows | Pass |
| Deliberate foreign-key violation | Entire transaction aborts without partial career/award writes | Pass |
| Repeated import | `ON CONFLICT DO NOTHING` limits results to one LeBron career row and 65 honors | Pass |
| Unrelated player | Jordan's identity retained; no career/accolade writes for any other player | Pass |
| Backup restore | Drop/recreate **temporary rehearsal DB**, `pg_restore` baseline, and verify initial identities with empty career/honors tables | Pass |

## Important boundaries

- This validates **transaction behavior and backup/restore mechanics in a synthetic throwaway database**. It does **not** verify a real production backup or prove a full Supabase restore can succeed.
- The rehearsal models only the relevant player, career and accolade tables, including foreign keys, uniqueness and status constraints. It is **not an exact production schema clone** and does not test all production triggers, permissions, RLS policies, indexes, or operational infrastructure.
- The script is a **test-only SQL emitter**. It is not a production importer. The intended production workflow still needs exact schema/constraint inspection, an isolated production-schema rehearsal or clone, safe snapshot, idempotency mapping, provenance review, and **fresh founder approval before writing**.
- No player season rows are fabricated from career aggregates. The LeBron Playoffs tab still requires a separate career-level summary data path until genuine season rows are imported.
- This test verified no duplicate records in the rehearsal; it must not be interpreted as proof that an unmodified production database is ready for the 66 proposed records.

## Next gate

Prepare a detailed founder-facing import diff and backed-up transactional implementation proposal, then separately request approval for any production Supabase write. PR #19 and PR #18 remain drafts. The website stays paused.
