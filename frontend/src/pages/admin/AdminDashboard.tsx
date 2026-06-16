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
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { name: string; flag: string } | null;
  awayTeam: { name: string; flag: string } | null;
}

const PHASE_LABELS: Record<string, string> = {
  group: 'Grupos',
  round_of_32: 'Oitavas',
  round_of_16: 'Quartas',
  quarterfinal: 'Semifinal',
  semifinal: 'Final',
  bronze: '3º Lugar',
  final: 'Final',
};

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
      setMatches(r.data);
      const initial: Record<number, { home: string; away: string }> = {};
      r.data.forEach((m) => {
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
        <h3 className="admin-section-title">Resultados</h3>
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

// ─── Dashboard principal ──────────────────────────────────────────
export default function AdminDashboard({ credentials, onLogout }: Props) {
  const [tab, setTab] = useState<'users' | 'results'>('results');

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
          ⚽ Resultados
        </button>
        <button className={`admin-tab ${tab === 'users' ? 'admin-tab--active' : ''}`} onClick={() => setTab('users')}>
          👤 Usuários
        </button>
      </div>

      {tab === 'results' ? (
        <UpdateResults credentials={credentials} />
      ) : (
        <RegisterUser credentials={credentials} />
      )}
    </div>
  );
}
