// Deadline: 17:00 CEST (UTC+2) = 15:00 UTC on the Swedish calendar date of the match
export function isMatchOpen(matchDate: Date | string): boolean {
  const now = new Date();
  const matchUtc = new Date(matchDate);

  // Match already started
  if (now >= matchUtc) return false;

  // Convert match time to CEST (UTC+2) to get the Swedish calendar date
  const matchCest = new Date(matchUtc.getTime() + 2 * 60 * 60 * 1000);
  const year = matchCest.getUTCFullYear();
  const month = matchCest.getUTCMonth();
  const day = matchCest.getUTCDate();

  // 17:00 CEST = 15:00 UTC on that Swedish date
  const deadline = new Date(Date.UTC(year, month, day, 15, 0, 0));

  return now < deadline;
}
