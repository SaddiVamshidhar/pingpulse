import { useState } from 'react';
import { getStatus, errorMessage } from '../api.js';
import usePolling from '../usePolling.js';
import StatusBadge from '../components/StatusBadge.jsx';

const BANNERS = {
  OPERATIONAL: { text: 'All systems operational', cls: 'banner-up' },
  PARTIAL_OUTAGE: { text: 'Partial outage', cls: 'banner-partial' },
  MAJOR_OUTAGE: { text: 'Major outage', cls: 'banner-down' },
  NO_MONITORS: { text: 'No active monitors', cls: 'banner-none' },
};

// Public, read-only page that can be shared with end users.
const StatusPage = () => {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  usePolling(async () => {
    try {
      setStatus(await getStatus());
    } catch (err) {
      setError(errorMessage(err));
    }
  }, 10000);

  if (error) return <div className="alert">{error}</div>;
  if (!status) return <div className="spinner" />;

  const banner = BANNERS[status.overall];

  return (
    <div className="status-page">
      <h1>Service Status</h1>
      <div className={`banner ${banner.cls}`}>{banner.text}</div>
      <ul className="status-list">
        {status.monitors.map((m) => (
          <li key={m._id}>
            <span>{m.name}</span>
            <span className="status-right">
              <span className="muted">{m.uptime24h != null ? `${m.uptime24h}% uptime` : ''}</span>
              <StatusBadge status={m.status} />
            </span>
          </li>
        ))}
      </ul>
      <p className="muted small">Last updated {new Date(status.generatedAt).toLocaleString()}</p>
    </div>
  );
};

export default StatusPage;
