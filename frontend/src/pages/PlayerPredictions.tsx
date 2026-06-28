import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

interface PredictionEntry {
  id: number;
  homeScore: number;
  awayScore: number;
  points: number | null;
  penaltyWinnerId: number | null;
  match: {
    id: number;
    matchDate: string;
    phase: string;
    groupLetter: string | null;
    homeScore: number | null;
    awayScore: number | null;
    homeTeamId: number | null;
    awayTeamId: number | null;
    homeTeam: { name: string; flag: string } | null;
    awayTeam: { name: string; flag: string } | null;
  };
}

interface PlayerData {
  user: { id: number; name: string };
  predictions: PredictionEntry[];
}

function Flag({ code, name }: { code: string; name: string }) {
  return <span className={`fi fi-${code} pred-flag`} title={name} />;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

function pointsBadge(points: number | null) {
  if (points === null) return <span className="pred-points" style={{ color: 'var(--text-2)' }}>aguardando</span>;
  if (points >= 5) return <span className="pred-points pred-points--exact">⭐ {points}pts</span>;
  if (points > 0)  return <span className="pred-points pred-points--partial">✓ {points}pts</span>;
  return <span className="pred-points pred-points--miss">✗ 0pts</span>;
}

export default function PlayerPredictions() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    api.get<PlayerData>(`/api/users/${id}/predictions`)
      .then((r) => setData(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Carregando...</div>;
  if (notFound || !data) return <div className="loading">Jogador não encontrado.</div>;

  const now = new Date();
  const total = data.predictions.reduce((s, p) => s + (p.points ?? 0), 0);
  const exact = data.predictions.filter((p) => p.points !== null && p.points >= 5).length;

  const filtered = data.predictions.filter((p) => {
    const isPast = new Date(p.match.matchDate) < now;
    return filter === 'past' ? isPast : !isPast;
  });

  const KNOCKOUT_PHASES = new Set(['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'bronze', 'final']);

  return (
    <div className="page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/')}>← Voltar</button>
        <div style={{ textAlign: 'right' }}>
          <h2 className="page-title">{data.user.name}</h2>
          <p className="page-subtitle">{total} pts · {exact} exatos · {data.predictions.length} palpites</p>
        </div>
      </header>

      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'upcoming' ? 'filter-tab--active' : ''}`} onClick={() => setFilter('upcoming')}>
          Próximos
        </button>
        <button className={`filter-tab ${filter === 'past' ? 'filter-tab--active' : ''}`} onClick={() => setFilter('past')}>
          Passados
        </button>
      </div>

      <div className="pred-list">
        {filtered.length === 0 && (
          <p className="empty-msg">Nenhum palpite nessa categoria.</p>
        )}
        {filtered.map((p) => {
          const m = p.match;
          const hasResult = m.homeScore !== null;
          const isKnockout = KNOCKOUT_PHASES.has(m.phase);
          const isPenaltyDraw = isKnockout && p.penaltyWinnerId !== null;
          const penaltyTeamName = isPenaltyDraw
            ? (p.penaltyWinnerId === m.homeTeamId ? m.homeTeam?.name : m.awayTeam?.name)
            : null;

          return (
            <div key={p.id} className={`pred-card ${hasResult ? 'pred-card--finished' : ''}`}>
              <div className="pred-card-top">
                <span className="result-date">{formatDate(m.matchDate)}</span>
                {pointsBadge(p.points)}
              </div>
              <div className="pred-card-teams">
                <div className="result-team">
                  {m.homeTeam && <Flag code={m.homeTeam.flag} name={m.homeTeam.name} />}
                  <span>{m.homeTeam?.name ?? '—'}</span>
                </div>
                <div className="pred-card-scores">
                  {hasResult && (
                    <span className="pred-official">{m.homeScore}×{m.awayScore}</span>
                  )}
                  <span className="pred-guess">{p.homeScore}×{p.awayScore}</span>
                  {!hasResult && <span className="pred-guess-label">palpite</span>}
                </div>
                <div className="result-team result-team--away">
                  {m.awayTeam && <Flag code={m.awayTeam.flag} name={m.awayTeam.name} />}
                  <span>{m.awayTeam?.name ?? '—'}</span>
                </div>
              </div>
              {isPenaltyDraw && penaltyTeamName && (
                <div className="pred-penalty-note">🥅 Pênaltis: {penaltyTeamName}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
