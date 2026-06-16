import { useState, FormEvent } from 'react';
import api from '../api';
import { AuthState } from '../types';

interface Props {
  onLogin: (data: AuthState) => void;
}

export default function Login({ onLogin }: Props) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post<AuthState>('/api/auth/login', { phone, password });
      onLogin(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Erro ao fazer login';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-trophy">🏆</div>
          <h1 className="login-title">Bolão</h1>
          <p className="login-subtitle">Copa do Mundo 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label className="field-label">Telefone</label>
            <input
              className="field-input"
              type="tel"
              inputMode="tel"
              placeholder="Ex: +5511999999999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label className="field-label">Senha (6 dígitos)</label>
            <input
              className="field-input"
              type="password"
              inputMode="numeric"
              placeholder="••••••"
              maxLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
