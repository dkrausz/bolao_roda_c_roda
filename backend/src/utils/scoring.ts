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

  // Who actually advanced (knockout)
  let actualWinnerId: number | null = null;
  if (isKnockout && matchHomeTeamId && matchAwayTeamId) {
    if (matchHome > matchAway) actualWinnerId = matchHomeTeamId;
    else if (matchAway > matchHome) actualWinnerId = matchAwayTeamId;
    else actualWinnerId = matchPenaltyWinnerId ?? null;
  }

  // Who user predicted would advance (knockout)
  let predWinnerId: number | null = null;
  if (isKnockout && matchHomeTeamId && matchAwayTeamId) {
    if (predHome > predAway) predWinnerId = matchHomeTeamId;
    else if (predAway > predHome) predWinnerId = matchAwayTeamId;
    else predWinnerId = predPenaltyWinnerId ?? null;
  }

  let pts = 0;

  // +3 for exact score
  const exactScore = predHome === matchHome && predAway === matchAway;
  if (exactScore) pts += 3;

  // +3 for correct result/winner
  if (isKnockout) {
    if (actualWinnerId !== null && predWinnerId !== null && actualWinnerId === predWinnerId) pts += 3;
  } else {
    const matchResult = Math.sign(matchHome - matchAway);
    const predResult  = Math.sign(predHome - predAway);
    if (matchResult === predResult) pts += 3;
  }

  return pts;
}
