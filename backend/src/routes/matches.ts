import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { isMatchOpen } from '../utils/deadline';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  const matches = await prisma.match.findMany({
    where: { matchDate: { not: null } },
    include: {
      homeTeam: { select: { id: true, name: true, flag: true } },
      awayTeam: { select: { id: true, name: true, flag: true } },
      predictions: {
        where: { userId },
        select: { homeScore: true, awayScore: true, points: true },
      },
    },
    orderBy: { matchDate: 'asc' },
  });

  const result = matches.map((m) => {
    const pred = m.predictions[0] ?? null;
    return {
      id: m.id,
      matchDate: m.matchDate,
      phase: m.phase,
      groupLetter: m.groupLetter,
      homeTeamId: m.homeTeam?.id ?? null,
      homeTeamName: m.homeTeam?.name ?? null,
      homeTeamFlag: m.homeTeam?.flag ?? null,
      awayTeamId: m.awayTeam?.id ?? null,
      awayTeamName: m.awayTeam?.name ?? null,
      awayTeamFlag: m.awayTeam?.flag ?? null,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      predHome: pred?.homeScore ?? null,
      predAway: pred?.awayScore ?? null,
      predPoints: pred?.points ?? null,
      isOpen: isMatchOpen(m.matchDate!),
    };
  });

  res.json(result);
});

export default router;
