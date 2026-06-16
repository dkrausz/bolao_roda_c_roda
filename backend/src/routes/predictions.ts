import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { isMatchOpen } from '../utils/deadline';

const router = Router();

router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { match_id, home_score, away_score } = req.body as {
    match_id?: number;
    home_score?: number;
    away_score?: number;
  };

  if (match_id === undefined || home_score === undefined || away_score === undefined) {
    res.status(400).json({ error: 'match_id, home_score e away_score são obrigatórios' });
    return;
  }

  if (!Number.isInteger(home_score) || home_score < 0 || !Number.isInteger(away_score) || away_score < 0) {
    res.status(400).json({ error: 'Placar inválido' });
    return;
  }

  const match = await prisma.match.findUnique({ where: { id: match_id } });

  if (!match) {
    res.status(404).json({ error: 'Jogo não encontrado' });
    return;
  }

  if (!match.matchDate || !isMatchOpen(match.matchDate)) {
    res.status(403).json({ error: 'Prazo para palpitar encerrado' });
    return;
  }

  const prediction = await prisma.prediction.upsert({
    where: { userId_matchId: { userId, matchId: match_id } },
    create: { userId, matchId: match_id, homeScore: home_score, awayScore: away_score },
    update: { homeScore: home_score, awayScore: away_score },
  });

  res.json(prediction);
});

router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const predictions = await prisma.prediction.findMany({
    where: { userId: req.user!.id },
    orderBy: { matchId: 'asc' },
  });
  res.json(predictions);
});

export default router;
