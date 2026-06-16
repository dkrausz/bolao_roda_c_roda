import { useEffect, useState, ReactNode } from 'react';
import api from '../api';

interface Props {
  children: ReactNode;
}

type Status = 'checking' | 'sleeping' | 'awake';

export default function ServerWakeup({ children }: Props) {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const ping = async () => {
      try {
        await api.get('/api/health', { timeout: 5000 });
        if (!cancelled) setStatus('awake');
      } catch {
        if (!cancelled) {
          setStatus('sleeping');
          timer = setTimeout(ping, 5000);
        }
      }
    };

    ping();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (status === 'awake') return <>{children}</>;

  return (
    <div className="wakeup-screen">
      <div className="wakeup-card">
        <div className="wakeup-icon">😴</div>
        <h2 className="wakeup-title">Servidor dormindo</h2>
        <p className="wakeup-msg">
          Já mandei acordar. Aguarde uns <strong>30 segundos</strong>…
        </p>
        <div className="wakeup-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
