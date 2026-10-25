import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getMonitors, errorMessage } from '../api.js';
import usePolling from '../usePolling.js';
import StatusBadge from '../components/StatusBadge.jsx';

const fmt = (v, suffix) => (v == null ? '--' : `${v}${suffix}`);

const Dashboard = () => {
  const [monitors, setMonitors] = useState(null);
  const [error, setError] = useState('');

  usePolling(async () => {
    try {
      setMonitors(await getMonitors());
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  }, 5000);

  if (error) return <div className="alert">Cannot reach API: {error}</div>;
  if (!monitors) return <div className="spinner" />;

  const up = monitors.filter((m) => m.status === 'UP').length;
  const down = monitors.filter((m) => m.status === 'DOWN').length;

  return (
    <>
      <header className="page-header">
        <h1>Monitors</h1>
        <Link to="/new" className="btn btn-primary">+ Add Monitor</Link>
      </header>

      <section className="summary">
        <div className="summary-card"><span>Total</span><strong>{monitors.length}</strong></div>
        <div className="summary-card up"><span>Up</span><strong>{up}</strong></div>
        <div className="summary-card down"><span>Down</span><strong>{down}</strong></div>
        <div className="summary-card"><span>Paused / Pending</span><strong>{monitors.length - up - down}</strong></div>
      </section>

      {monitors.length === 0 ? (
        <p className="muted">No monitors yet. Add your first website to start monitoring.</p>
      ) : (
        <div className="grid">
          {monitors.map((m) => (
            <Link to={`/monitor/${m._id}`} key={m._id} className={`card card-${m.status.toLowerCase()}`}>
              <div className="card-top">
                <h3>{m.name}</h3>
                <StatusBadge status={m.status} />
              </div>
              <p className="url">{m.url}</p>
              <div className="card-stats">
                <div><span>Uptime 24h</span><strong>{fmt(m.uptime24h, '%')}</strong></div>
                <div><span>Latency</span><strong>{fmt(m.lastResponseTime, ' ms')}</strong></div>
                <div><span>Every</span><strong>{m.intervalSec}s</strong></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default Dashboard;
