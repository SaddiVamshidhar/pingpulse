import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getMonitor, getChecks, toggleMonitor, deleteMonitor, errorMessage } from '../api.js';
import usePolling from '../usePolling.js';
import StatusBadge from '../components/StatusBadge.jsx';
import LatencyChart from '../components/LatencyChart.jsx';

const fmt = (v, suffix) => (v == null ? '--' : `${v}${suffix}`);

const MonitorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [monitor, setMonitor] = useState(null);
  const [checks, setChecks] = useState([]);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = async () => {
    try {
      const [m, c] = await Promise.all([getMonitor(id), getChecks(id)]);
      setMonitor(m);
      setChecks(c);
    } catch (err) {
      setError(errorMessage(err));
    }
  };
  usePolling(load, 5000, [id]);

  const onToggle = async () => {
    await toggleMonitor(id);
    load();
  };

  const onDelete = async () => {
    await deleteMonitor(id);
    navigate('/');
  };

  if (error) return <div className="alert">{error}</div>;
  if (!monitor) return <div className="spinner" />;

  return (
    <>
      <Link to="/" className="back">&larr; All monitors</Link>
      <header className="page-header">
        <div>
          <h1>{monitor.name} <StatusBadge status={monitor.status} /></h1>
          <a href={monitor.url} target="_blank" rel="noreferrer" className="url">{monitor.url}</a>
        </div>
        <div className="actions">
          <Link to={`/edit/${id}`} className="btn">Edit</Link>
          <button className="btn" onClick={onToggle}>{monitor.isActive ? 'Pause' : 'Resume'}</button>
          {confirmDelete ? (
            <>
              <button className="btn btn-danger" onClick={onDelete}>Confirm delete</button>
              <button className="btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
            </>
          ) : (
            <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>Delete</button>
          )}
        </div>
      </header>

      <section className="summary">
        <div className="summary-card"><span>Uptime (24h)</span><strong>{fmt(monitor.uptime24h, '%')}</strong></div>
        <div className="summary-card"><span>Avg response</span><strong>{fmt(monitor.avgResponseTime, ' ms')}</strong></div>
        <div className="summary-card"><span>Checks (24h)</span><strong>{monitor.totalChecks24h}</strong></div>
        <div className="summary-card">
          <span>Last checked</span>
          <strong className="small">
            {monitor.lastCheckedAt ? new Date(monitor.lastCheckedAt).toLocaleTimeString() : '--'}
          </strong>
        </div>
      </section>

      <section className="panel">
        <h2>Response time</h2>
        <LatencyChart checks={checks} />
      </section>

      <section className="panel">
        <h2>Recent checks</h2>
        <table className="table">
          <thead>
            <tr><th>Time</th><th>Status</th><th>HTTP</th><th>Response</th><th>Error</th></tr>
          </thead>
          <tbody>
            {checks.slice(0, 15).map((c) => (
              <tr key={c._id}>
                <td>{new Date(c.checkedAt).toLocaleTimeString()}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>{c.statusCode ?? '--'}</td>
                <td>{fmt(c.responseTime, ' ms')}</td>
                <td className="muted">{c.error || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default MonitorDetail;
