/**
 * One-time script to wire playoff bracket progression.
 * Run after migrations: npx ts-node prisma/bracketLink.ts
 *
 * Bracket logic (World Cup 2026):
 *   R32[0,1]   → R16[0]   | R32[2,3]   → R16[1]   | ... | R32[14,15] → R16[7]
 *   R16[0,1]   → QF[0]    | R16[2,3]   → QF[1]    | R16[4,5] → QF[2] | R16[6,7] → QF[3]
 *   QF[0,1]    → SF[0]    | QF[2,3]    → SF[1]
 *   SF[0] winner → Final home | SF[1] winner → Final away
 *   SF[0] loser  → Bronze home | SF[1] loser  → Bronze away
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const byPhase = async (phase: string) =>
    prisma.match.findMany({ where: { phase: phase as any }, orderBy: { matchDate: 'asc' } });

  const r32 = await byPhase('round_of_32');
  const r16 = await byPhase('round_of_16');
  const qf  = await byPhase('quarterfinal');
  const sf  = await byPhase('semifinal');
  const [bronze] = await byPhase('bronze');
  const [final]  = await byPhase('final');

  if (r32.length !== 16) throw new Error(`Expected 16 R32 matches, got ${r32.length}`);
  if (r16.length !== 8)  throw new Error(`Expected 8 R16 matches, got ${r16.length}`);
  if (qf.length  !== 4)  throw new Error(`Expected 4 QF matches, got ${qf.length}`);
  if (sf.length  !== 2)  throw new Error(`Expected 2 SF matches, got ${sf.length}`);
  if (!bronze) throw new Error('Bronze match not found');
  if (!final)  throw new Error('Final match not found');

  const updates: Promise<unknown>[] = [];

  // R32 → R16: pairs of 2 feed into 1
  for (let i = 0; i < 8; i++) {
    const homeMatch = r32[i * 2];
    const awayMatch = r32[i * 2 + 1];
    const target    = r16[i];
    updates.push(
      prisma.match.update({ where: { id: homeMatch.id }, data: { nextMatchId: target.id, nextMatchSlot: 'home' } }),
      prisma.match.update({ where: { id: awayMatch.id }, data: { nextMatchId: target.id, nextMatchSlot: 'away' } }),
    );
  }

  // R16 → QF: pairs of 2 feed into 1
  for (let i = 0; i < 4; i++) {
    const homeMatch = r16[i * 2];
    const awayMatch = r16[i * 2 + 1];
    const target    = qf[i];
    updates.push(
      prisma.match.update({ where: { id: homeMatch.id }, data: { nextMatchId: target.id, nextMatchSlot: 'home' } }),
      prisma.match.update({ where: { id: awayMatch.id }, data: { nextMatchId: target.id, nextMatchSlot: 'away' } }),
    );
  }

  // QF → SF: pairs of 2 feed into 1
  for (let i = 0; i < 2; i++) {
    const homeMatch = qf[i * 2];
    const awayMatch = qf[i * 2 + 1];
    const target    = sf[i];
    updates.push(
      prisma.match.update({ where: { id: homeMatch.id }, data: { nextMatchId: target.id, nextMatchSlot: 'home' } }),
      prisma.match.update({ where: { id: awayMatch.id }, data: { nextMatchId: target.id, nextMatchSlot: 'away' } }),
    );
  }

  // SF → Final (winner) + Bronze (loser)
  updates.push(
    prisma.match.update({
      where: { id: sf[0].id },
      data: { nextMatchId: final.id, nextMatchSlot: 'home', loserMatchId: bronze.id, loserMatchSlot: 'home' },
    }),
    prisma.match.update({
      where: { id: sf[1].id },
      data: { nextMatchId: final.id, nextMatchSlot: 'away', loserMatchId: bronze.id, loserMatchSlot: 'away' },
    }),
  );

  await Promise.all(updates);
  console.log('Chaveamento vinculado com sucesso!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
