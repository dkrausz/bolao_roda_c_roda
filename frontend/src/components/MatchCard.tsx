import { useState, useEffect } from 'react';
import { Match } from '../types';

function TeamFlag({ code, name }: { code: string | null; name: string | null }) {
  if (!code) return <span className="fi team-flag-img" title={name ?? ''} />;
  return <span className={`fi fi-${code} team-flag-img`} title={name ?? ''} />;
}

interface Props {
  match: Match;
  onSave: (matchId: number, home: number, away: number, penaltyWinnerId?: number) => Promise<void>;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

function pointsLabel(points: number | null) {
  if (points === 6) return { text: '⭐ 6 pts', cls: 'exact' };
  if (points === 3) return { text: '✓ 3 pts', cls: 'partial' };
  if (points === 0) return { text: '✗ 0 pts', cls: 'miss' };
  return null;
}

const KNOCKOUT_PHASES = new Set(['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'bronze', 'final']);

export default function MatchCard({ match, onSave }: Props) {
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [penaltyWinner, setPenaltyWinner] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isKnockout = KNOCKOUT_PHASES.has(match.phase);

  useEffect(() => {
    if (match.predHome !== null) setHome(String(match.predHome));
    if (match.predAway !== null) setAway(String(match.predAway));
    if (match.predPenaltyWinnerId !== null) setPenaltyWinner(String(match.predPenaltyWinnerId));
  }, [match.predHome, match.predAway, match.predPenaltyWinnerId]);

  const isFinished = match.homeScore !== null && match.awayScore !== null;
  const hasPred = match.predHome !== null && match.predAway !== null;
  const pts = pointsLabel(match.predPoints);

  const isDraw = home !== '' && away !== '' && home === away;
  const needsPenalty = isKnockout && isDraw;
  const canSave = home !== '' && away !== '' && (!needsPenalty || !!penaltyWinner);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const pwId = needsPenalty && penaltyWinner ? Number(penaltyWinner) : undefined;
      await onSave(match.id, Number(home), Number(away), pwId);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`match-card${isFinished ? ' match-card--finished' : ''}${!match.isOpen && !isFinished ? ' match-card--locked' : ''}`}>
      <div className="match-time">{formatTime(match.matchDate)}</div>

      <div className="match-teams">
        {/* Casa */}
        <div className="team">
          <TeamFlag code={match.homeTeamFlag} name={match.homeTeamName} />
          <span className="team-name">{match.homeTeamName ?? 'A definir'}</span>
        </div>

        {/* Centro */}
        <div className="match-center">
          {isFinished ? (
            <div className="official-score">
              <span>{match.homeScore}</span>
              <span className="score-sep">×</span>
              <span>{match.awayScore}</span>
            </div>
          ) : (
            <div className="pred-inputs">
              <input
                className="score-input"
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={home}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  setHome(v);
                  if (v !== away) setPenaltyWinner('');
                }}
                disabled={!match.isOpen}
                placeholder="—"
              />
              <span className="score-sep">×</span>
              <input
                className="score-input"
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={away}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  setAway(v);
                  if (home !== v) setPenaltyWinner('');
                }}
                disabled={!match.isOpen}
                placeholder="—"
              />
            </div>
          )}

          {isFinished && pts && (
            <div className={`pred-points pred-points--${pts.cls}`}>{pts.text}</div>
          )}
          {isFinished && hasPred && (
            <div className="pred-saved-score">Seu palpite: {match.predHome}×{match.predAway}</div>
          )}
        </div>

        {/* Visitante */}
        <div className="team team--away">
          <TeamFlag code={match.awayTeamFlag} name={match.awayTeamName} />
          <span className="team-name">{match.awayTeamName ?? 'A definir'}</span>
        </div>
      </div>

      {/* Seletor de pênaltis — mata-mata com empate */}
      {isKnockout && !isFinished && match.isOpen && isDraw && (
        <div className="penalty-selector">
          <span className="penalty-label">Quem passa nos pênaltis?</span>
          <div className="penalty-options">
            <button
              type="button"
              className={`penalty-option${penaltyWinner === String(match.homeTeamId) ? ' penalty-option--active' : ''}`}
              onClick={() => setPenaltyWinner(String(match.homeTeamId))}
            >
              <TeamFlag code={match.homeTeamFlag} name={match.homeTeamName} />
              <span>{match.homeTeamName}</span>
            </button>
            <button
              type="button"
              className={`penalty-option${penaltyWinner === String(match.awayTeamId) ? ' penalty-option--active' : ''}`}
              onClick={() => setPenaltyWinner(String(match.awayTeamId))}
            >
              <TeamFlag code={match.awayTeamFlag} name={match.awayTeamName} />
              <span>{match.awayTeamName}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mostrar quem o usuário previu nos pênaltis (jogo finalizado) */}
      {isKnockout && isFinished && hasPred && match.predPenaltyWinnerId && (
        <div className="pred-saved-score">
          Palpite pênaltis: {
            match.predPenaltyWinnerId === match.homeTeamId ? match.homeTeamName :
            match.predPenaltyWinnerId === match.awayTeamId ? match.awayTeamName : '—'
          }
        </div>
      )}

      {match.isOpen && (
        <button
          className={`btn-save${saved ? ' btn-save--saved' : ''}`}
          onClick={handleSave}
          disabled={saving || !canSave}
        >
          {saved ? 'Salvo ✓' : saving ? 'Salvando...' : hasPred ? 'Atualizar palpite' : 'Salvar palpite'}
        </button>
      )}

      {!match.isOpen && !isFinished && (
        <div className="locked-msg">🔒 Prazo encerrado</div>
      )}
    </div>
  );
}
