-- Every assertion runs only against a disposable CI database.
BEGIN;
INSERT INTO public.player_playoff_career_stats (
  player_id,games_played,postseasons_played,points_total,rebounds_total,
  assists_total,steals_total,blocks_total,field_goals_made,field_goals_attempted,
  career_ppg,career_fg_pct,source_cutoff,verification_status
) VALUES (7,302,18,8521,2695,2168,506,287,3055,6167,8521.0/302,3055.0/6167,'2025-26','cross_checked')
ON CONFLICT (player_id) DO NOTHING;
INSERT INTO public.player_playoff_career_stats (
  player_id,games_played,source_cutoff
) VALUES (7,999,'bad duplicate')
ON CONFLICT (player_id) DO NOTHING;
INSERT INTO public.player_accolades (player_id,league,accolade_type,accolade_name,result,season_year,team)
VALUES (7,'NBA','mvp','NBA MVP',NULL,2009,NULL)
ON CONFLICT DO NOTHING;
INSERT INTO public.player_accolades (player_id,league,accolade_type,accolade_name,result,season_year,team)
VALUES (7,'NBA','mvp','NBA MVP',NULL,2009,NULL)
ON CONFLICT DO NOTHING;
DO $$
BEGIN
 IF (SELECT COUNT(*) FROM public.player_playoff_career_stats WHERE player_id=7) <> 1
   THEN RAISE EXCEPTION 'playoff career duplicate'; END IF;
 IF (SELECT games_played FROM public.player_playoff_career_stats WHERE player_id=7) <> 302
   THEN RAISE EXCEPTION 'playoff career overwritten'; END IF;
 IF (SELECT COUNT(*) FROM public.player_accolades WHERE player_id=7) <> 1
   THEN RAISE EXCEPTION 'award duplicate'; END IF;
 IF EXISTS (SELECT 1 FROM public.player_playoff_career_stats WHERE player_id=1)
   THEN RAISE EXCEPTION 'Jordan modified'; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='player_playoff_career_stats'
   AND cmd='SELECT' AND 'anon'=ANY(roles))
   THEN RAISE EXCEPTION 'missing public read policy'; END IF;
END $$;
ROLLBACK;
DO $$
BEGIN
 IF EXISTS (SELECT 1 FROM public.player_playoff_career_stats)
    OR EXISTS (SELECT 1 FROM public.player_accolades)
 THEN RAISE EXCEPTION 'rollback failed'; END IF;
END $$;
