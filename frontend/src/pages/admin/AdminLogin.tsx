import { useState, FormEvent } from 'react';
import { saveAdminCredentials, adminApi } from '../../adminApi';

interface Props {
  onLogin: (credentials: string) => void;
}

export default function AdminLogin({ onLogin }: Props) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const credentials = saveAdminCredentials(user, pass);
    try {
      await adminApi(credentials).get('/api/admin/users');
      onLogin(credentials);
    } catch {
      setError('Usuário ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-trophy">⚙️</div>
          <h1 className="login-title">Admin</h1>
          <p className="login-subtitle">Bolão Copa 2026</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label className="field-label">Usuário</label>
            <input className="field-input" value={user} onChange={(e) => setUser(e.target.value)} required autoComplete="username" />
          </div>
          <div className="field">
            <label className="field-label">Senha</label>
            <input className="field-input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} required autoComplete="current-password" />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
