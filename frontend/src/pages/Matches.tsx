import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { Match } from '../types';
import MatchCard from '../components/MatchCard';

const PHASE_LABELS: Record<string, string> = {
  round_of_32: '1/16 avos de Final',
  round_of_16: 'Oitavas de Final',
  quarterfinal: 'Quartas de Final',
  semifinal: 'Semifinal',
  bronze: '3º Lugar',
  final: 'Final',
};

function formatDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    timeZone: 'America/Sao_Paulo',
  });
}

function groupByDay(matches: Match[]): [string, Match[]][] {
  const map = new Map<string, Match[]>();
  for (const m of matches) {
    const key = new Date(m.matchDate).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(() => {
    api
      .get<Match[]>('/api/matches')
      .then((r) => setMatches(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const handleSave = async (matchId: number, home: number, away: number) => {
    await api.post('/api/predictions', { match_id: matchId, home_score: home, away_score: away });
    fetchMatches();
  };

  if (loading) return <div className="loading">Carregando jogos...</div>;

  const grouped = groupByDay(matches);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2 className="page-title">Jogos</h2>
          <p className="page-subtitle">Prazo: 1h antes de cada jogo</p>
        </div>
      </header>

      {grouped.map(([dateKey, dayMatches]) => {
        const first = dayMatches[0];
        const isGroup = first.phase === 'group';
        const groups = isGroup
          ? [...new Set(dayMatches.map((m) => m.groupLetter).filter(Boolean))].sort()
          : null;

        return (
          <section key={dateKey} className="day-section">
            <div className="day-header">
              <span className="day-label">{formatDay(first.matchDate)}</span>
              {isGroup && groups && (
                <span className="phase-badge">Grupo{groups.length > 1 ? 's' : ''} {groups.join(', ')}</span>
              )}
              {!isGroup && (
                <span className="phase-badge">{PHASE_LABELS[first.phase] ?? first.phase}</span>
              )}
            </div>

            {dayMatches.map((match) => (
              <MatchCard key={match.id} match={match} onSave={handleSave} />
            ))}
          </section>
        );
      })}
    </div>
  );
}
