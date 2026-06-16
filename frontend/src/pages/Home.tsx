import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { RankingEntry, AuthState } from '../types';

interface Props {
  auth: AuthState | null;
  onLogout: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

function FodaseModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-fodase" onClick={(e) => e.stopPropagation()}>
        <p className="fodase-text">FODA-SE</p>
        <button className="btn-primary" style={{ marginTop: 32 }} onClick={onClose}>
          Ok, entendi
        </button>
      </div>
    </div>
  );
}

export default function Home({ auth, onLogout }: Props) {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<RankingEntry[]>('/api/ranking')
      .then((r) => setRanking(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      {showModal && <FodaseModal onClose={() => setShowModal(false)} />}

      <header className="page-header">
        <div>
          <h2 className="page-title">🏆 Bolão Copa 2026</h2>
          <p className="page-subtitle">Classificação geral</p>
        </div>
        {auth ? (
          <button className="btn-logout" onClick={onLogout}>Sair</button>
        ) : (
          <button className="btn-entrar" onClick={() => navigate('/entrar')}>Entrar</button>
        )}
      </header>

      {/* Ranking */}
      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="ranking-list">
          {ranking.map((entry, i) => {
            const isMe = auth?.user.name === entry.name;
            return (
              <div
                key={entry.id}
                className={`ranking-item ${isMe ? 'ranking-item--me' : ''}`}
                onClick={() => navigate(`/jogador/${entry.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <span className="ranking-pos">{MEDALS[i] ?? `#${i + 1}`}</span>
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

      {/* Regras */}
      <section className="rules-section">
        <h3 className="rules-title">📋 Regras</h3>
        <div className="rules-list">
          <div className="rule-item">
            <span className="rule-icon">⭐</span>
            <div>
              <strong>Placar exato</strong>
              <span className="rule-pts">5 pontos</span>
            </div>
          </div>
          <div className="rule-item">
            <span className="rule-icon">✓</span>
            <div>
              <strong>Resultado correto</strong>
              <p className="rule-desc">Acertou o vencedor ou que seria empate (mas não o placar)</p>
              <span className="rule-pts">2 pontos</span>
            </div>
          </div>
          <div className="rule-item">
            <span className="rule-icon">✗</span>
            <div>
              <strong>Errou</strong>
              <span className="rule-pts">0 pontos</span>
            </div>
          </div>
          <div className="rule-item">
            <span className="rule-icon">⏰</span>
            <div>
              <strong>Prazo para palpitar</strong>
              <p className="rule-desc">17h00 horário da Suécia (CEST) no dia do jogo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Botão piada */}
      <div style={{ padding: '8px 12px 32px' }}>
        <button className="btn-recover" onClick={() => setShowModal(true)}>
          Clique aqui para recuperar seus pontos anteriores
        </button>
      </div>
    </div>
  );
}
