import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

interface RankingRow {
  id: number;
  name: string;
  total_points: number;
  exact_scores: number;
  correct_results: number;
  total_predictions: number;
}

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const rows = await prisma.$queryRaw<RankingRow[]>(Prisma.sql`
    SELECT
      u.id,
      u.name,
      COALESCE(SUM(p.points), 0)::int                        AS total_points,
      COUNT(CASE WHEN p.points = 5 THEN 1 END)::int          AS exact_scores,
      COUNT(CASE WHEN p.points = 2 THEN 1 END)::int          AS correct_results,
      COUNT(p.id)::int                                       AS total_predictions
    FROM users u
    LEFT JOIN predictions p ON p.user_id = u.id
    GROUP BY u.id, u.name
    ORDER BY total_points DESC, exact_scores DESC, u.name ASC
  `);

  res.json(rows);
});

export default router;
