import { useState, useEffect, useCallback } from 'react';
import { adminApi, clearAdminCredentials } from '../../adminApi';

interface Props {
  credentials: string;
  onLogout: () => void;
}

interface AdminMatch {
  id: number;
  matchDate: string;
  phase: string;
  groupLetter: string | null;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  penaltyWinnerId: number | null;
  homeTeam: { name: string; flag: string } | null;
  awayTeam: { name: string; flag: string } | null;
}

interface TeamOption {
  id: number;
  name: string;
  flag: string;
  groupLetter: string;
}

const PHASE_LABELS: Record<string, string> = {
  group: 'Grupos',
  round_of_32: '1/16 avos',
  round_of_16: 'Oitavas',
  quarterfinal: 'Quartas',
  semifinal: 'Semifinal',
  bronze: '3º Lugar',
  final: 'Final',
};

const KNOCKOUT_PHASES = ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'bronze', 'final'];

function Flag({ code, name }: { code: string; name: string }) {
  return <span className={`fi fi-${code} match-flag`} title={name} />;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

// ─── Cadastrar Usuário ────────────────────────────────────────────
function RegisterUser({ credentials }: { credentials: string }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone || password.length !== 6) {
      setMsg({ type: 'err', text: 'Preencha todos os campos (senha: 6 dígitos)' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await adminApi(credentials).post('/api/admin/users', { name, phone, password });
      setMsg({ type: 'ok', text: `Usuário "${name}" cadastrado com sucesso!` });
      setName(''); setPhone(''); setPassword('');
    } catch (e: unknown) {
      const err = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setMsg({ type: 'err', text: err ?? 'Erro ao cadastrar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-section">
      <h3 className="admin-section-title">Cadastrar Usuário</h3>
      <div className="admin-form">
        <div className="field">
          <label className="field-label">Nome</label>
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
        </div>
        <div className="field">
          <label className="field-label">Telefone</label>
          <input className="field-input" type="tel" inputMode="tel" value={phone}
            onChange={(e) => setPhone(e.target.value)} placeholder="+5511999999999" />
        </div>
        <div className="field">
          <label className="field-label">Senha (6 dígitos)</label>
          <input className="field-input" type="password" inputMode="numeric" maxLength={6}
            value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••••" />
        </div>
        {msg && <p className={msg.type === 'ok' ? 'success-msg' : 'error-msg'}>{msg.text}</p>}
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Salvando...' : 'Cadastrar'}
        </button>
      </div>
    </div>
  );
}

// ─── Atualizar Resultados ─────────────────────────────────────────
function UpdateResults({ credentials }: { credentials: string }) {
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [scores, setScores] = useState<Record<number, { home: string; away: string }>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');

  const fetchMatches = useCallback(() => {
    adminApi(credentials).get<AdminMatch[]>('/api/admin/matches').then((r) => {
      // Only group matches in this tab
      const groupMatches = r.data.filter((m) => m.phase === 'group');
      setMatches(groupMatches);
      const initial: Record<number, { home: string; away: string }> = {};
      groupMatches.forEach((m) => {
        initial[m.id] = {
          home: m.homeScore !== null ? String(m.homeScore) : '',
          away: m.awayScore !== null ? String(m.awayScore) : '',
        };
      });
      setScores(initial);
    });
  }, [credentials]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const handleSave = async (id: number) => {
    const s = scores[id];
    if (s.home === '' || s.away === '') return;
    setSaving((p) => ({ ...p, [id]: true }));
    try {
      await adminApi(credentials).put(`/api/admin/matches/${id}/result`, {
        home_score: Number(s.home),
        away_score: Number(s.away),
      });
      setSaved((p) => ({ ...p, [id]: true }));
      setTimeout(() => setSaved((p) => ({ ...p, [id]: false })), 2000);
      fetchMatches();
    } finally {
      setSaving((p) => ({ ...p, [id]: false }));
    }
  };

  const filtered = matches.filter((m) => {
    if (filter === 'pending') return m.homeScore === null;
    if (filter === 'done') return m.homeScore !== null;
    return true;
  });

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3 className="admin-section-title">Resultados — Grupos</h3>
        <div className="filter-tabs">
          {(['all', 'pending', 'done'] as const).map((f) => (
            <button key={f} className={`filter-tab ${filter === f ? 'filter-tab--active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Todos' : f === 'pending' ? 'Sem resultado' : 'Finalizados'}
            </button>
          ))}
        </div>
      </div>

      <div className="results-list">
        {filtered.map((match) => {
          const s = scores[match.id] ?? { home: '', away: '' };
          const hasResult = match.homeScore !== null;
          const isSaving = saving[match.id];
          const isSaved = saved[match.id];

          return (
            <div key={match.id} className={`result-row ${hasResult ? 'result-row--done' : ''}`}>
              <div className="result-meta">
                <span className="result-date">{formatDate(match.matchDate)}</span>
                <span className="result-phase">
                  {PHASE_LABELS[match.phase] ?? match.phase}
                  {match.groupLetter ? ` ${match.groupLetter}` : ''}
                </span>
              </div>

              <div className="result-teams">
                <div className="result-team">
                  {match.homeTeam && <Flag code={match.homeTeam.flag} name={match.homeTeam.name} />}
                  <span>{match.homeTeam?.name ?? '—'}</span>
                </div>

                <div className="result-score-inputs">
                  <input
                    className="score-input"
                    type="number" inputMode="numeric" min={0} max={99}
                    value={s.home}
                    onChange={(e) => setScores((p) => ({ ...p, [match.id]: { ...p[match.id], home: e.target.value.replace(/\D/g, '') } }))}
                    placeholder={hasResult ? String(match.homeScore) : '—'}
                  />
                  <span className="score-sep">×</span>
                  <input
                    className="score-input"
                    type="number" inputMode="numeric" min={0} max={99}
                    value={s.away}
                    onChange={(e) => setScores((p) => ({ ...p, [match.id]: { ...p[match.id], away: e.target.value.replace(/\D/g, '') } }))}
                    placeholder={hasResult ? String(match.awayScore) : '—'}
                  />
                </div>

                <div className="result-team result-team--away">
                  {match.awayTeam && <Flag code={match.awayTeam.flag} name={match.awayTeam.name} />}
                  <span>{match.awayTeam?.name ?? '—'}</span>
                </div>
              </div>

              <button
                className={`btn-save ${isSaved ? 'btn-save--saved' : ''}`}
                onClick={() => handleSave(match.id)}
                disabled={isSaving || s.home === '' || s.away === ''}
              >
                {isSaved ? 'Salvo ✓' : isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-componente por jogo do mata-mata ────────────────────────
interface KnockoutRowProps {
  match: AdminMatch;
  teams: TeamOption[];
  credentials: string;
  onRefresh: () => void;
}

function KnockoutRow({ match, teams, credentials, onRefresh }: KnockoutRowProps) {
  const [homeScore, setHomeScore] = useState(match.homeScore !== null ? String(match.homeScore) : '');
  const [awayScore, setAwayScore] = useState(match.awayScore !== null ? String(match.awayScore) : '');
  const [penaltyWinner, setPenaltyWinner] = useState('');
  const [homeTeamSel, setHomeTeamSel] = useState('');
  const [awayTeamSel, setAwayTeamSel] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');

  const hasTeams = !!(match.homeTeam && match.awayTeam);
  const hasResult = match.homeScore !== null;
  const isDraw = homeScore !== '' && awayScore !== '' && homeScore === awayScore;

  const teamsByGroup = teams.reduce<Record<string, TeamOption[]>>((acc, t) => {
    (acc[t.groupLetter] ??= []).push(t);
    return acc;
  }, {});

  const handleSaveTeams = async () => {
    if (!homeTeamSel && !awayTeamSel) return;
    setSaving(true);
    try {
      await adminApi(credentials).put(`/api/admin/matches/${match.id}/teams`, {
        ...(homeTeamSel && { home_team_id: Number(homeTeamSel) }),
        ...(awayTeamSel && { away_team_id: Number(awayTeamSel) }),
      });
      setSaved('teams');
      setTimeout(() => setSaved(''), 2000);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveResult = async () => {
    if (homeScore === '' || awayScore === '') return;
    if (isDraw && !penaltyWinner) return;
    setSaving(true);
    try {
      await adminApi(credentials).put(`/api/admin/matches/${match.id}/result`, {
        home_score: Number(homeScore),
        away_score: Number(awayScore),
        ...(isDraw && penaltyWinner && { penalty_winner_id: Number(penaltyWinner) }),
      });
      setSaved('result');
      setTimeout(() => setSaved(''), 2000);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`result-row ${hasResult ? 'result-row--done' : ''}`}>
      <div className="result-meta">
        <span className="result-date">{formatDate(match.matchDate)}</span>
        <span className="result-phase">{PHASE_LABELS[match.phase]}</span>
      </div>

      {/* Team assignment — shown when teams missing */}
      {!hasTeams && (
        <div className="playoff-team-assign">
          <div className="playoff-team-row">
            <label className="field-label">Mandante</label>
            {match.homeTeam ? (
              <span className="playoff-team-set">
                <Flag code={match.homeTeam.flag} name={match.homeTeam.name} />
                {match.homeTeam.name}
              </span>
            ) : (
              <select
                className="field-input field-input--select"
                value={homeTeamSel}
                onChange={(e) => setHomeTeamSel(e.target.value)}
              >
                <option value="">— selecionar time —</option>
                {Object.entries(teamsByGroup).sort().map(([grp, ts]) => (
                  <optgroup key={grp} label={`Grupo ${grp}`}>
                    {ts.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </optgroup>
                ))}
              </select>
            )}
          </div>
          <div className="playoff-team-row">
            <label className="field-label">Visitante</label>
            {match.awayTeam ? (
              <span className="playoff-team-set">
                <Flag code={match.awayTeam.flag} name={match.awayTeam.name} />
                {match.awayTeam.name}
              </span>
            ) : (
              <select
                className="field-input field-input--select"
                value={awayTeamSel}
                onChange={(e) => setAwayTeamSel(e.target.value)}
              >
                <option value="">— selecionar time —</option>
                {Object.entries(teamsByGroup).sort().map(([grp, ts]) => (
                  <optgroup key={grp} label={`Grupo ${grp}`}>
                    {ts.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </optgroup>
                ))}
              </select>
            )}
          </div>
          {(!match.homeTeam || !match.awayTeam) && (
            <button
              className={`btn-save ${saved === 'teams' ? 'btn-save--saved' : ''}`}
              onClick={handleSaveTeams}
              disabled={saving || (!homeTeamSel && !match.homeTeam) || (!awayTeamSel && !match.awayTeam)}
            >
              {saved === 'teams' ? 'Salvo ✓' : saving ? 'Salvando...' : 'Definir Times'}
            </button>
          )}
        </div>
      )}

      {/* Score inputs — shown when teams are set */}
      {hasTeams && (
        <>
          <div className="result-teams">
            <div className="result-team">
              {match.homeTeam && <Flag code={match.homeTeam.flag} name={match.homeTeam.name} />}
              <span>{match.homeTeam?.name ?? '—'}</span>
            </div>

            <div className="result-score-inputs">
              <input
                className="score-input"
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={homeScore}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  setHomeScore(v);
                  if (v !== awayScore) setPenaltyWinner('');
                }}
                placeholder="—"
              />
              <span className="score-sep">×</span>
              <input
                className="score-input"
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={awayScore}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  setAwayScore(v);
                  if (homeScore !== v) setPenaltyWinner('');
                }}
                placeholder="—"
              />
            </div>

            <div className="result-team result-team--away">
              {match.awayTeam && <Flag code={match.awayTeam.flag} name={match.awayTeam.name} />}
              <span>{match.awayTeam?.name ?? '—'}</span>
            </div>
          </div>

          {/* Penalty winner — só aparece quando placar está empatado */}
          {isDraw && (
            <div className="penalty-selector">
              <span className="penalty-label">Quem passou nos pênaltis?</span>
              <div className="penalty-options">
                <button
                  type="button"
                  className={`penalty-option${penaltyWinner === String(match.homeTeamId) ? ' penalty-option--active' : ''}`}
                  onClick={() => setPenaltyWinner(String(match.homeTeamId))}
                >
                  {match.homeTeam && <Flag code={match.homeTeam.flag} name={match.homeTeam.name} />}
                  <span>{match.homeTeam?.name}</span>
                </button>
                <button
                  type="button"
                  className={`penalty-option${penaltyWinner === String(match.awayTeamId) ? ' penalty-option--active' : ''}`}
                  onClick={() => setPenaltyWinner(String(match.awayTeamId))}
                >
                  {match.awayTeam && <Flag code={match.awayTeam.flag} name={match.awayTeam.name} />}
                  <span>{match.awayTeam?.name}</span>
                </button>
              </div>
            </div>
          )}

          <button
            className={`btn-save ${saved === 'result' ? 'btn-save--saved' : ''}`}
            onClick={handleSaveResult}
            disabled={saving || homeScore === '' || awayScore === '' || (isDraw && !penaltyWinner)}
          >
            {saved === 'result' ? 'Salvo ✓' : saving ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      )}

      {hasResult && (
        <p className="playoff-advance-note">Próximo jogo atualizado automaticamente</p>
      )}
    </div>
  );
}

// ─── Playoffs: atribuir times + resultados ─────────────────────────
function PlayoffAdmin({ credentials }: { credentials: string }) {
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [phaseFilter, setPhaseFilter] = useState<string>('round_of_32');

  const fetchAll = useCallback(() => {
    Promise.all([
      adminApi(credentials).get<AdminMatch[]>('/api/admin/matches'),
      adminApi(credentials).get<TeamOption[]>('/api/admin/teams'),
    ]).then(([matchRes, teamRes]) => {
      setMatches(matchRes.data.filter((m) => KNOCKOUT_PHASES.includes(m.phase)));
      setTeams(teamRes.data);
    });
  }, [credentials]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const phaseMatches = matches.filter((m) => m.phase === phaseFilter);

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3 className="admin-section-title">Mata-Mata</h3>
      </div>

      <div className="filter-tabs" style={{ marginBottom: 16 }}>
        {KNOCKOUT_PHASES.map((p) => (
          <button
            key={p}
            className={`filter-tab ${phaseFilter === p ? 'filter-tab--active' : ''}`}
            onClick={() => setPhaseFilter(p)}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      <div className="results-list">
        {phaseMatches.map((match) => (
          <KnockoutRow
            key={match.id}
            match={match}
            teams={teams}
            credentials={credentials}
            onRefresh={fetchAll}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────────────
export default function AdminDashboard({ credentials, onLogout }: Props) {
  const [tab, setTab] = useState<'users' | 'results' | 'playoff'>('results');

  const handleLogout = () => {
    clearAdminCredentials();
    onLogout();
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2 className="page-title">⚙️ Admin</h2>
          <p className="page-subtitle">Bolão Copa 2026</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Sair</button>
      </header>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'results' ? 'admin-tab--active' : ''}`} onClick={() => setTab('results')}>
          ⚽ Grupos
        </button>
        <button className={`admin-tab ${tab === 'playoff' ? 'admin-tab--active' : ''}`} onClick={() => setTab('playoff')}>
          🥊 Mata-Mata
        </button>
        <button className={`admin-tab ${tab === 'users' ? 'admin-tab--active' : ''}`} onClick={() => setTab('users')}>
          👤 Usuários
        </button>
      </div>

      {tab === 'results' && <UpdateResults credentials={credentials} />}
      {tab === 'playoff' && <PlayoffAdmin credentials={credentials} />}
      {tab === 'users' && <RegisterUser credentials={credentials} />}
    </div>
  );
}
