import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { getAdminCredentials, clearAdminCredentials } from '../../adminApi';

export default function AdminApp() {
  const [credentials, setCredentials] = useState<string | null>(null);

  useEffect(() => {
    const stored = getAdminCredentials();
    if (stored) setCredentials(stored);
  }, []);

  const handleLogout = () => {
    clearAdminCredentials();
    setCredentials(null);
  };

  if (!credentials) {
    return <AdminLogin onLogin={setCredentials} />;
  }

  return <AdminDashboard credentials={credentials} onLogout={handleLogout} />;
}
