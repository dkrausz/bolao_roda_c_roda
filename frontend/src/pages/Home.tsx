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
        <h3 className="rules-title">📋 Pontuação</h3>
        <div className="rules-list">
          <div className="rule-item">
            <span className="rule-icon">🎯</span>
            <div>
              <strong>Placar exato</strong>
              <p className="rule-desc">Acertou o placar certinho</p>
              <span className="rule-pts">+3 pontos</span>
            </div>
          </div>
          <div className="rule-item">
            <span className="rule-icon">✓</span>
            <div>
              <strong>Vencedor correto</strong>
              <p className="rule-desc">Acertou quem vence (ou que seria empate)</p>
              <span className="rule-pts">+3 pontos</span>
            </div>
          </div>
          <div className="rule-item rule-item--highlight">
            <span className="rule-icon">⭐</span>
            <div>
              <strong>Placar exato + vencedor</strong>
              <p className="rule-desc">As duas coisas certas ao mesmo tempo</p>
              <span className="rule-pts">6 pontos</span>
            </div>
          </div>
          <div className="rule-item">
            <span className="rule-icon">🥊</span>
            <div>
              <strong>Mata-Mata — pênaltis</strong>
              <p className="rule-desc">Em empates, escolha quem passa. Acertar o vencedor vale +3</p>
            </div>
          </div>
          <div className="rule-item">
            <span className="rule-icon">⏰</span>
            <div>
              <strong>Prazo para palpitar</strong>
              <p className="rule-desc">Até 1 hora antes do início de cada jogo</p>
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
