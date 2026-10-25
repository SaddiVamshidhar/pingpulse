import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMonitor, getMonitor, updateMonitor, errorMessage } from '../api.js';

const MonitorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', url: 'https://', intervalSec: 30 });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      getMonitor(id)
        .then((m) => setForm({ name: m.name, url: m.url, intervalSec: m.intervalSec }))
        .catch((err) => setError(errorMessage(err)));
    }
  }, [id]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = { ...form, intervalSec: Number(form.intervalSec) };
      const saved = id ? await updateMonitor(id, body) : await createMonitor(body);
      navigate(`/monitor/${saved._id}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-wrap">
      <h1>{id ? 'Edit Monitor' : 'Add a New Monitor'}</h1>
      {error && <div className="alert">{error}</div>}
      <form onSubmit={onSubmit} className="form">
        <label>
          Friendly name
          <input name="name" value={form.name} onChange={onChange} placeholder="College Website" required />
        </label>
        <label>
          URL to monitor
          <input name="url" type="url" value={form.url} onChange={onChange} required />
        </label>
        <label>
          Check interval (seconds)
          <input name="intervalSec" type="number" min="10" max="3600" value={form.intervalSec} onChange={onChange} />
        </label>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : id ? 'Save Changes' : 'Start Monitoring'}
        </button>
      </form>
    </div>
  );
};

export default MonitorForm;
