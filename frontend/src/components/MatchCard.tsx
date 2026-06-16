import { useState, useEffect } from 'react';
import { Match } from '../types';

function TeamFlag({ code, name }: { code: string | null; name: string | null }) {
  if (!code) return <span className="fi team-flag-img" title={name ?? ''} />;
  return <span className={`fi fi-${code} team-flag-img`} title={name ?? ''} />;
}

interface Props {
  match: Match;
  onSave: (matchId: number, home: number, away: number) => Promise<void>;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

function pointsLabel(points: number | null) {
  if (points === 5) return { text: '⭐ 5 pts', cls: 'exact' };
  if (points === 2) return { text: '✓ 2 pts', cls: 'partial' };
  if (points === 0) return { text: '✗ 0 pts', cls: 'miss' };
  return null;
}

export default function MatchCard({ match, onSave }: Props) {
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (match.predHome !== null) setHome(String(match.predHome));
    if (match.predAway !== null) setAway(String(match.predAway));
  }, [match.predHome, match.predAway]);

  const isFinished = match.homeScore !== null && match.awayScore !== null;
  const hasPred = match.predHome !== null && match.predAway !== null;
  const pts = pointsLabel(match.predPoints);

  const handleSave = async () => {
    if (home === '' || away === '') return;
    setSaving(true);
    try {
      await onSave(match.id, Number(home), Number(away));
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
                type="number"
                inputMode="numeric"
                min={0} max={99}
                value={home}
                onChange={(e) => setHome(e.target.value.replace(/\D/g, '').slice(0, 2))}
                disabled={!match.isOpen}
                placeholder="—"
              />
              <span className="score-sep">×</span>
              <input
                className="score-input"
                type="number"
                inputMode="numeric"
                min={0} max={99}
                value={away}
                onChange={(e) => setAway(e.target.value.replace(/\D/g, '').slice(0, 2))}
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

      {match.isOpen && (
        <button
          className={`btn-save${saved ? ' btn-save--saved' : ''}`}
          onClick={handleSave}
          disabled={saving || home === '' || away === ''}
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
