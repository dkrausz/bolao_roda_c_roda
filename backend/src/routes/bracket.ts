import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

const KNOCKOUT_PHASES = ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'bronze', 'final'] as const;

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const matches = await prisma.match.findMany({
    where: { phase: { in: [...KNOCKOUT_PHASES] } },
    include: {
      homeTeam: { select: { name: true, flag: true } },
      awayTeam: { select: { name: true, flag: true } },
      penaltyWinner: { select: { name: true, flag: true } },
    },
    orderBy: { matchDate: 'asc' },
  });

  const grouped: Record<string, typeof matches> = {};
  for (const phase of KNOCKOUT_PHASES) {
    grouped[phase] = matches.filter((m) => m.phase === phase);
  }

  res.json(grouped);
});

export default router;
