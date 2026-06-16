import { useEffect, useState } from 'react';
import api from '../api';
import { RankingEntry } from '../types';

interface Props {
  userName: string;
  onLogout: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Ranking({ userName, onLogout }: Props) {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<RankingEntry[]>('/api/ranking')
      .then((r) => setRanking(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2 className="page-title">Classificação</h2>
          <p className="page-subtitle">Copa do Mundo 2026</p>
        </div>
        <button className="btn-logout" onClick={onLogout}>Sair</button>
      </header>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="ranking-list">
          {ranking.map((entry, i) => {
            const isMe = entry.name === userName;
            return (
              <div key={entry.id} className={`ranking-item ${isMe ? 'ranking-item--me' : ''}`}>
                <span className="ranking-pos">
                  {MEDALS[i] ?? `#${i + 1}`}
                </span>
                <div className="ranking-info">
                  <span className="ranking-name">
                    {entry.name}
                    {isMe && <span className="ranking-you"> (você)</span>}
                  </span>
                  <span className="ranking-detail">
                    {entry.exact_scores} exatos · {entry.correct_results} resultados · {entry.total_predictions} palpites
                  </span>
                </div>
                <span className="ranking-pts">{entry.total_points} pts</span>
              </div>
            );
          })}

          {ranking.length === 0 && (
            <p className="empty-msg">Nenhum palpite registrado ainda.</p>
          )}
        </div>
      )}
    </div>
  );
}
