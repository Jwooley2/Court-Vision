-- RECOVERY ONLY — DO NOT RUN DURING NORMAL OPERATION.
-- Matches the Nov 8, 2026 LeBron-only import. Restore exact preimage.
-- This is scoped compensating rollback, NOT a full production database backup.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='30s';
SELECT pg_advisory_xact_lock(2220261108);
LOCK TABLE public.players,public.player_career_stats,public.player_accolades,
  public.player_playoff_career_stats IN SHARE ROW EXCLUSIVE MODE;
DO $pre$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.players WHERE id=7 AND external_id='lebron_james'
    AND seasons_played=23 AND round(career_ppg,1)=26.8) THEN
    RAISE EXCEPTION 'Player 7 no longer matches imported snapshot; abort';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.player_career_stats WHERE id=2 AND player_id=7 AND games_played=1622)
    OR NOT EXISTS (SELECT 1 FROM public.player_playoff_career_stats WHERE id=1 AND player_id=7 AND games_played=302)
    OR (SELECT count(*) FROM public.player_accolades WHERE player_id=7 AND id BETWEEN 98 AND 162)<>65
    OR (SELECT count(*) FROM public.player_accolades WHERE player_id=7)<>65
  THEN RAISE EXCEPTION 'Import IDs/counts diverged; abort instead of deleting new data'; END IF;
END $pre$;
DELETE FROM public.player_accolades WHERE player_id=7 AND id BETWEEN 98 AND 162;
DELETE FROM public.player_playoff_career_stats WHERE player_id=7 AND id=1;
DELETE FROM public.player_career_stats WHERE player_id=7 AND id=2;
UPDATE public.players SET
  seasons_played=21, career_ppg=27.2, career_rpg=7.5, career_apg=7.3,
  career_spg=1.5, career_bpg=0.7
WHERE id=7 AND external_id='lebron_james';
DO $post$
BEGIN
 IF EXISTS (SELECT 1 FROM public.player_career_stats WHERE player_id=7)
 OR EXISTS (SELECT 1 FROM public.player_playoff_career_stats WHERE player_id=7)
 OR EXISTS (SELECT 1 FROM public.player_accolades WHERE player_id=7)
 OR NOT EXISTS (SELECT 1 FROM public.players WHERE id=7 AND seasons_played=21 AND career_ppg=27.2)
 THEN RAISE EXCEPTION 'Rollback verification failed'; END IF;
END $post$;
COMMIT;
-- Additive playoff career table retained (may be used by other players).
