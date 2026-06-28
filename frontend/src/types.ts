export type Phase =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarterfinal'
  | 'semifinal'
  | 'bronze'
  | 'final';

export interface Match {
  id: number;
  matchDate: string;
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

export interface RankingEntry {
  id: number;
  name: string;
  total_points: number;
  exact_scores: number;
  correct_results: number;
  total_predictions: number;
}

export interface AuthState {
  token: string;
  user: { id: number; name: string };
}

export interface BracketMatch {
  id: number;
  matchDate: string | null;
  phase: Phase;
  homeTeamId: number | null;
  homeScore: number | null;
  awayTeamId: number | null;
  awayScore: number | null;
  homeTeam: { name: string; flag: string } | null;
  awayTeam: { name: string; flag: string } | null;
  nextMatchId: number | null;
  nextMatchSlot: string | null;
  loserMatchId: number | null;
  loserMatchSlot: string | null;
}

export interface BracketData {
  round_of_32: BracketMatch[];
  round_of_16: BracketMatch[];
  quarterfinal: BracketMatch[];
  semifinal: BracketMatch[];
  bronze: BracketMatch[];
  final: BracketMatch[];
}
