import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Phase } from '@prisma/client';
import prisma from '../lib/prisma';
import { adminAuth } from '../middleware/adminAuth';
import { calculatePoints } from '../utils/scoring';

const router = Router();

router.post('/users', adminAuth, async (req: Request, res: Response): Promise<void> => {
  const { name, phone, password } = req.body as { name?: string; phone?: string; password?: string };

  if (!name || !phone || !password) {
    res.status(400).json({ error: 'nome, telefone e senha são obrigatórios' });
    return;
  }

  if (!/^\d{6}$/.test(String(password))) {
    res.status(400).json({ error: 'Senha deve ter exatamente 6 dígitos numéricos' });
    return;
  }

  const user = await prisma.user.create({
    data: { name, phone, passwordHash: await bcrypt.hash(String(password), 10) },
    select: { id: true, name: true, phone: true },
  });

  res.status(201).json(user);
});

router.get('/users', adminAuth, async (_req: Request, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, phone: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

router.get('/teams', adminAuth, async (_req: Request, res: Response): Promise<void> => {
  const teams = await prisma.team.findMany({
    select: { id: true, name: true, flag: true, groupLetter: true },
    orderBy: [{ groupLetter: 'asc' }, { name: 'asc' }],
  });
  res.json(teams);
});

// Set or update teams for a knockout match
router.put('/matches/:id/teams', adminAuth, async (req: Request, res: Response): Promise<void> => {
  const matchId = Number(req.params.id);
  const { home_team_id, away_team_id } = req.body as { home_team_id?: number | null; away_team_id?: number | null };

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      ...(home_team_id !== undefined && { homeTeamId: home_team_id }),
      ...(away_team_id !== undefined && { awayTeamId: away_team_id }),
    },
    include: {
      homeTeam: { select: { name: true, flag: true } },
      awayTeam: { select: { name: true, flag: true } },
    },
  });

  res.json(match);
});

router.put('/matches/:id/result', adminAuth, async (req: Request, res: Response): Promise<void> => {
  const matchId = Number(req.params.id);
  const { home_score, away_score, penalty_winner_id } = req.body as {
    home_score?: number;
    away_score?: number;
    penalty_winner_id?: number | null;
  };

  if (home_score === undefined || away_score === undefined) {
    res.status(400).json({ error: 'home_score e away_score são obrigatórios' });
    return;
  }

  const isDraw = home_score === away_score;

  if (isDraw && penalty_winner_id === undefined) {
    // Allow saving a draw without penalty winner for group matches — only require it for knockout
    const existing = await prisma.match.findUnique({ where: { id: matchId }, select: { phase: true } });
    if (existing && existing.phase !== 'group') {
      res.status(400).json({ error: 'Empate em mata-mata requer penalty_winner_id' });
      return;
    }
  }

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: home_score,
      awayScore: away_score,
      penaltyWinnerId: isDraw ? (penalty_winner_id ?? null) : null,
    },
    include: { homeTeam: true, awayTeam: true },
  });

  const predictions = await prisma.prediction.findMany({ where: { matchId } });

  await Promise.all(
    predictions.map((pred) =>
      prisma.prediction.update({
        where: { id: pred.id },
        data: { points: calculatePoints(home_score, away_score, pred.homeScore, pred.awayScore) },
      })
    )
  );

  // Auto-advance knockout bracket
  const isKnockout = match.phase !== 'group';
  if (isKnockout && match.homeTeamId && match.awayTeamId) {
    let winnerId: number;
    let loserId: number;

    if (home_score > away_score) {
      winnerId = match.homeTeamId;
      loserId  = match.awayTeamId;
    } else if (away_score > home_score) {
      winnerId = match.awayTeamId;
      loserId  = match.homeTeamId;
    } else if (penalty_winner_id) {
      // Draw — winner decided on penalties
      winnerId = penalty_winner_id;
      loserId  = penalty_winner_id === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
    } else {
      // Draw with no penalty winner yet — don't advance
      res.json({ ok: true, predictions_updated: predictions.length });
      return;
    }

    const bracketMatch = await prisma.match.findUnique({
      where: { id: matchId },
      select: { nextMatchId: true, nextMatchSlot: true, loserMatchId: true, loserMatchSlot: true },
    });

    const ops: Promise<unknown>[] = [];

    if (bracketMatch?.nextMatchId && bracketMatch.nextMatchSlot) {
      ops.push(
        prisma.match.update({
          where: { id: bracketMatch.nextMatchId },
          data: bracketMatch.nextMatchSlot === 'home'
            ? { homeTeamId: winnerId }
            : { awayTeamId: winnerId },
        })
      );
    }

    if (bracketMatch?.loserMatchId && bracketMatch.loserMatchSlot) {
      ops.push(
        prisma.match.update({
          where: { id: bracketMatch.loserMatchId },
          data: bracketMatch.loserMatchSlot === 'home'
            ? { homeTeamId: loserId }
            : { awayTeamId: loserId },
        })
      );
    }

    await Promise.all(ops);
  }

  res.json({ ok: true, predictions_updated: predictions.length });
});

router.get('/matches', adminAuth, async (_req: Request, res: Response): Promise<void> => {
  const matches = await prisma.match.findMany({
    where: { matchDate: { not: null } },
    include: {
      homeTeam: { select: { name: true, flag: true } },
      awayTeam: { select: { name: true, flag: true } },
    },
    orderBy: { matchDate: 'asc' },
  });
  res.json(matches);
});

router.post('/matches', adminAuth, async (req: Request, res: Response): Promise<void> => {
  const { home_team_id, away_team_id, match_date, phase, group_letter } = req.body as {
    home_team_id?: number;
    away_team_id?: number;
    match_date?: string;
    phase?: string;
    group_letter?: string;
  };

  if (!match_date || !phase) {
    res.status(400).json({ error: 'match_date e phase são obrigatórios' });
    return;
  }

  const match = await prisma.match.create({
    data: {
      matchDate: new Date(match_date),
      phase: phase as Phase,
      groupLetter: group_letter ?? null,
      homeTeamId: home_team_id ?? null,
      awayTeamId: away_team_id ?? null,
    },
  });

  res.status(201).json(match);
});

router.put('/matches/:id', adminAuth, async (req: Request, res: Response): Promise<void> => {
  const matchId = Number(req.params.id);
  const { home_team_id, away_team_id, match_date, phase, group_letter } = req.body as {
    home_team_id?: number;
    away_team_id?: number;
    match_date?: string;
    phase?: string;
    group_letter?: string;
  };

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      ...(home_team_id !== undefined && { homeTeamId: home_team_id }),
      ...(away_team_id !== undefined && { awayTeamId: away_team_id }),
      ...(match_date && { matchDate: new Date(match_date) }),
      ...(phase && { phase: phase as Phase }),
      ...(group_letter !== undefined && { groupLetter: group_letter }),
    },
  });

  res.json(match);
});

export default router;
