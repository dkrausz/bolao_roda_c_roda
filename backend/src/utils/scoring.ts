export function calculatePoints(
  matchHome: number,
  matchAway: number,
  predHome: number,
  predAway: number
): number {
  if (predHome === matchHome && predAway === matchAway) return 5;

  const matchResult = Math.sign(matchHome - matchAway);
  const predResult = Math.sign(predHome - predAway);

  if (matchResult === predResult) return 2;

  return 0;
}
