import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/:id/predictions', async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  });

  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  const predictions = await prisma.prediction.findMany({
    where: { userId },
    select: {
      id: true,
      homeScore: true,
      awayScore: true,
      points: true,
      penaltyWinnerId: true,
      match: {
        select: {
          id: true,
          matchDate: true,
          phase: true,
          groupLetter: true,
          homeScore: true,
          awayScore: true,
          homeTeamId: true,
          awayTeamId: true,
          homeTeam: { select: { name: true, flag: true } },
          awayTeam: { select: { name: true, flag: true } },
        },
      },
    },
    orderBy: { match: { matchDate: 'asc' } },
  });

  res.json({ user, predictions });
});

export default router;
