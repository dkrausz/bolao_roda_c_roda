import { Phase } from '@prisma/client';

export interface JwtPayload {
  id: number;
  name: string;
  phone: string;
}

export interface MatchResponse {
  id: number;
  matchDate: Date | null;
  phase: Phase;
  groupLetter: string | null;
  homeTeamId: number | null;
  homeTeamName: string | null;
  homeTeamFlag: string | null;
  awayTeamId: number | null;
  awayTeamName: string | null;
  awayTeamFlag: string | null;
  homeScore: number | null;
  awayScore: number | null;
  predHome: number | null;
  predAway: number | null;
  predPoints: number | null;
  isOpen: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
