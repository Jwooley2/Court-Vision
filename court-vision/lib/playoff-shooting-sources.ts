/**
 * Audited, immutable career shooting totals for historical players.
 * They supplement incomplete season schemas without writing to Supabase.
 * Values must be verified across independent authoritative sources.
 */
type PlayoffShooting = {
  games: number;
  fgm: number;
  fga: number;
  primaryUrl: string;
  crossCheckUrl: string;
  asOf: string;
};
const VERIFIED_PLAYOFF_SHOOTING: Record<string, PlayoffShooting> = {
  michael_jordan: {
    games: 179,
    fgm: 2188,
    fga: 4497,
    primaryUrl: "https://www.nba.com/stats/alltime-leaders?ActiveFlag=No&SeasonType=Playoffs",
    crossCheckUrl: "https://goheels.com/documents/download/2025/12/30/25-26_M-Basketball_Record_Book.pdf",
    asOf: "2026-11-08",
  },
};

/** Do not apply figures if stored season game counts differ from the audited source. */
export function readPlayoffShooting(externalId: unknown, games: number) {
  if (typeof externalId !== "string") return null;
  const source = VERIFIED_PLAYOFF_SHOOTING[externalId];
  if (!source || source.games !== games || source.fga <= 0 ||
    source.fgm < 0 || source.fgm > source.fga) return null;
  return {
    percentage: source.fgm / source.fga,
    fgm: source.fgm,
    fga: source.fga,
    primaryUrl: source.primaryUrl,
    crossCheckUrl: source.crossCheckUrl,
    asOf: source.asOf,
  };
}
