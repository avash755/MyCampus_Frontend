import { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import Modal from './Modal';
import Icon from './Icon';

function initialDate() {
  return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
}

export default function EventForm({ onClose }) {
  const { addEvent } = useWorkspace();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', category: 'Workshop', description: '', date: initialDate(),
    time: '2:00 PM', location: '', coverTone: 'violet'
  });

  function update(key, value) { setForm((current) => ({ ...current, [key]: value })); }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await addEvent({ ...form, date: new Date(form.date + 'T12:00:00').toISOString() });
      onClose();
    } catch (err) {
      setError(err.message || 'Could not create this event.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Create a campus event" subtitle="Bring people together around something good." onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <label className="field-label">Event name<input required maxLength="120" value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. Intro to photography" /></label>
        <div className="form-grid">
          <label className="field-label">Category<select value={form.category} onChange={(event) => update('category', event.target.value)}><option>Workshop</option><option>Community</option><option>Career</option><option>Social</option><option>Academic</option></select></label>
          <label className="field-label">Date<input type="date" required value={form.date} onChange={(event) => update('date', event.target.value)} /></label>
        </div>
        <div className="form-grid">
          <label className="field-label">Time<input required value={form.time} onChange={(event) => update('time', event.target.value)} placeholder="2:00 PM" /></label>
          <label className="field-label">Location<input required value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Building and room" /></label>
        </div>
        <label className="field-label">A little about it<textarea required maxLength="2000" rows="4" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="What should students know?" /></label>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? 'Creating…' : <><Icon name="plus" size={16} /> Create event</>}</button></div>
      </form>
    </Modal>
  );
}