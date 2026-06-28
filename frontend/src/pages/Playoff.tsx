import { useState, useEffect } from 'react';
import axios from 'axios';
import type { BracketData, BracketMatch } from '../types';

const API = import.meta.env.VITE_API_URL ?? '';
const REFRESH_MS = 30_000;

function Flag({ code, name }: { code: string; name: string }) {
  return <span className={`fi fi-${code} match-flag`} title={name} />;
}

function formatDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

function MatchTile({ match }: { match: BracketMatch }) {
  const finished = match.homeScore !== null && match.awayScore !== null;
  const homeName = match.homeTeam?.name ?? 'A definir';
  const awayName = match.awayTeam?.name ?? 'A definir';
  const penWinner = match.penaltyWinnerId;
  const homeWon = finished && (match.homeScore! > match.awayScore! || (match.homeScore === match.awayScore && penWinner === match.homeTeamId));
  const awayWon = finished && (match.awayScore! > match.homeScore! || (match.homeScore === match.awayScore && penWinner === match.awayTeamId));

  return (
    <div className={`bracket-tile ${finished ? 'bracket-tile--done' : ''}`}>
      <div className="bracket-date">{formatDate(match.matchDate)}</div>
      <div className={`bracket-team ${homeWon ? 'bracket-team--winner' : ''} ${!match.homeTeam ? 'bracket-team--tbd' : ''}`}>
        {match.homeTeam ? (
          <>
            <Flag code={match.homeTeam.flag} name={homeName} />
            <span className="bracket-team-name">{homeName}</span>
          </>
        ) : (
          <span className="bracket-team-name bracket-team--tbd">A definir</span>
        )}
        {finished && <span className="bracket-score">{match.homeScore}</span>}
      </div>
      <div className={`bracket-team ${awayWon ? 'bracket-team--winner' : ''} ${!match.awayTeam ? 'bracket-team--tbd' : ''}`}>
        {match.awayTeam ? (
          <>
            <Flag code={match.awayTeam.flag} name={awayName} />
            <span className="bracket-team-name">{awayName}</span>
          </>
        ) : (
          <span className="bracket-team-name bracket-team--tbd">A definir</span>
        )}
        {finished && <span className="bracket-score">{match.awayScore}</span>}
      </div>
      {finished && penWinner && (
        <div className="bracket-penalty-note">
          {match.penaltyWinner?.name ?? ''} avançou nos pênaltis
        </div>
      )}
    </div>
  );
}

function PhaseSection({ title, matches }: { title: string; matches: BracketMatch[] }) {
  if (!matches.length) return null;
  return (
    <div className="bracket-phase">
      <h3 className="bracket-phase-title">{title}</h3>
      <div className="bracket-phase-matches">
        {matches.map((m) => <MatchTile key={m.id} match={m} />)}
      </div>
    </div>
  );
}

export default function MataMata() {
  const [data, setData] = useState<BracketData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBracket = async () => {
    try {
      const res = await axios.get<BracketData>(`${API}/api/bracket`);
      setData(res.data);
      setLastUpdated(new Date());
    } catch {
      // keep previous data on error
    }
  };

  useEffect(() => {
    fetchBracket();
    const interval = setInterval(fetchBracket, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const phases: [string, keyof BracketData][] = [
    ['1/16 avos de Final', 'round_of_32'],
    ['Oitavas de Final', 'round_of_16'],
    ['Quartas de Final', 'quarterfinal'],
    ['Semifinais', 'semifinal'],
    ['3º Lugar', 'bronze'],
    ['Final', 'final'],
  ];

  return (
    <div className="page page--bracket">
      <header className="page-header">
        <div>
          <h2 className="page-title">Mata-Mata</h2>
          <p className="page-subtitle">Copa do Mundo 2026</p>
        </div>
        {lastUpdated && (
          <span className="bracket-refresh-hint">
            Atualiza automaticamente
          </span>
        )}
      </header>

      {!data ? (
        <div className="loading-state">Carregando chaveamento...</div>
      ) : (
        <div className="bracket-container">
          {phases.map(([label, key]) => (
            <PhaseSection key={key} title={label} matches={data[key]} />
          ))}
        </div>
      )}

      <div style={{ height: 80 }} />
    </div>
  );
}
