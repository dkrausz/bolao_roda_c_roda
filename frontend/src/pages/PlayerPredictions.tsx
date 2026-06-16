import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

interface PredictionEntry {
  id: number;
  homeScore: number;
  awayScore: number;
  points: number | null;
  match: {
    id: number;
    matchDate: string;
    phase: string;
    groupLetter: string | null;
    homeScore: number | null;
    awayScore: number | null;
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
  if (points === 5) return <span className="pred-points pred-points--exact">⭐ 5pts</span>;
  if (points === 2) return <span className="pred-points pred-points--partial">✓ 2pts</span>;
  if (points === 0) return <span className="pred-points pred-points--miss">✗ 0pts</span>;
  return <span className="pred-points" style={{ color: 'var(--text-2)' }}>aguardando</span>;
}

export default function PlayerPredictions() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get<PlayerData>(`/api/users/${id}/predictions`)
      .then((r) => setData(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Carregando...</div>;
  if (notFound || !data) return <div className="loading">Jogador não encontrado.</div>;

  const total = data.predictions.reduce((s, p) => s + (p.points ?? 0), 0);
  const exact = data.predictions.filter((p) => p.points === 5).length;

  return (
    <div className="page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/')}>← Voltar</button>
        <div style={{ textAlign: 'right' }}>
          <h2 className="page-title">{data.user.name}</h2>
          <p className="page-subtitle">{total} pts · {exact} exatos · {data.predictions.length} palpites</p>
        </div>
      </header>

      <div className="pred-list">
        {data.predictions.length === 0 && (
          <p className="empty-msg">Nenhum palpite ainda.</p>
        )}
        {data.predictions.map((p) => {
          const m = p.match;
          const hasResult = m.homeScore !== null;
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
