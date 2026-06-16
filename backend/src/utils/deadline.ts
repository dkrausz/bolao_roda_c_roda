// Prazo: 1 hora antes do início do jogo
export function isMatchOpen(matchDate: Date | string): boolean {
  const now = new Date();
  const kickoff = new Date(matchDate);
  const deadline = new Date(kickoff.getTime() - 60 * 60 * 1000);
  return now < deadline;
}
