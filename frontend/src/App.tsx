import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Matches from './pages/Matches';
import Playoff from './pages/Playoff';
import PlayerPredictions from './pages/PlayerPredictions';
import BottomNav from './components/BottomNav';
import AdminApp from './pages/admin/AdminApp';
import ServerWakeup from './components/ServerWakeup';
import { AuthState } from './types';

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) setAuth({ token, user: JSON.parse(user) });
  }, []);

  const handleLogin = (data: AuthState) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAuth(data);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(null);
  };

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ServerWakeup>
      <Routes>
        {/* Admin — rota separada */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* Rotas públicas + usuário */}
        <Route path="/*" element={
          <div className="app-container">
            <Routes>
              <Route path="/" element={<Home auth={auth} onLogout={handleLogout} />} />
              <Route path="/entrar" element={
                auth ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
              } />
              <Route path="/jogador/:id" element={<PlayerPredictions />} />
              <Route path="/jogos" element={
                auth ? <Matches /> : <Navigate to="/entrar" replace />
              } />
              <Route path="/playoff" element={<Playoff />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            {auth && <BottomNav />}
          </div>
        } />
      </Routes>
      </ServerWakeup>
    </BrowserRouter>
  );
}
