export function calculatePoints(
  matchHome: number,
  matchAway: number,
  predHome: number,
  predAway: number,
  matchPenaltyWinnerId?: number | null,
  predPenaltyWinnerId?: number | null,
  matchHomeTeamId?: number | null,
  matchAwayTeamId?: number | null,
): number {
  const isKnockout = matchPenaltyWinnerId !== undefined;
  const isDraw = matchHome === matchAway;

  // Determine who actually advanced (knockout only)
  let actualWinnerId: number | null = null;
  if (isKnockout && matchHomeTeamId && matchAwayTeamId) {
    if (matchHome > matchAway) actualWinnerId = matchHomeTeamId;
    else if (matchAway > matchHome) actualWinnerId = matchAwayTeamId;
    else actualWinnerId = matchPenaltyWinnerId ?? null;
  }

  // Determine who user predicted would advance
  let predWinnerId: number | null = null;
  if (isKnockout && matchHomeTeamId && matchAwayTeamId) {
    if (predHome > predAway) predWinnerId = matchHomeTeamId;
    else if (predAway > predHome) predWinnerId = matchAwayTeamId;
    else predWinnerId = predPenaltyWinnerId ?? null;
  }

  // Exact score check
  if (predHome === matchHome && predAway === matchAway) {
    if (!isKnockout) return 5; // group stage: exact score = 5 pts
    // Knockout exact score: also check penalty winner for draws
    if (!isDraw) return 5;
    // Both predicted a draw — check penalty winner
    if (predPenaltyWinnerId && matchPenaltyWinnerId && predPenaltyWinnerId === matchPenaltyWinnerId) return 5;
    // Correct draw score but wrong/missing penalty winner
    return actualWinnerId !== null && predWinnerId !== null && actualWinnerId === predWinnerId ? 2 : 0;
  }

  // Correct result / correct team advancing
  if (isKnockout) {
    if (actualWinnerId !== null && predWinnerId !== null && actualWinnerId === predWinnerId) return 2;
    return 0;
  }

  // Group stage: correct result (win/draw/loss direction)
  const matchResult = Math.sign(matchHome - matchAway);
  const predResult  = Math.sign(predHome - predAway);
  if (matchResult === predResult) return 2;

  return 0;
}
