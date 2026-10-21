import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import Icon from './Icon';
import { API_URL } from '../services/campusService';

const tones = ['violet', 'peach', 'mint', 'blue'];
const getId = (value) => String(value?.id || value?._id || value || '');

function getParts(value) {
  const date = new Date(value);
  return {
    month: date.toLocaleDateString('en', { month: 'short' }).toUpperCase(),
    day: date.toLocaleDateString('en', { day: '2-digit' }),
    weekday: date.toLocaleDateString('en', { weekday: 'short' })
  };
}

export default function EventCard({ event, compact = false }) {
  const { user } = useAuth();
  const { registerEvent, removeEvent } = useWorkspace();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const attendees = event.attendees || [];
  const registered = attendees.some((person) => getId(person) === getId(user));
  const capacity = Number(event.capacity) || null;
  const attendeeCount = Number(event.attendeeCount ?? attendees.length);
  const full = Boolean(capacity && attendeeCount >= capacity);
  const past = new Date(event.date) <= new Date();
  const canManage = user?.role === 'admin' || getId(event.organizer) === getId(user);
  const parts = getParts(event.date);
  const tone = tones.includes(event.coverTone) ? event.coverTone : 'violet';

  async function toggleRegistration() {
    setBusy(true); setError('');
    try { await registerEvent(event); }
    catch (err) { setError(err.message || 'Could not update your registration.'); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!window.confirm(`Remove “${event.title}” from campus events?`)) return;
    setBusy(true); setError('');
    try { await removeEvent(event); }
    catch (err) { setError(err.message || 'Could not remove this event.'); }
    finally { setBusy(false); }
  }

  return (
    <article className={'event-card ' + (compact ? 'event-card-compact' : '')}>
      <div className={'event-art event-art-' + tone}>
        <div className="event-art-orbit event-art-orbit-one" /><div className="event-art-orbit event-art-orbit-two" />
        <span className="event-art-category">{event.category || 'Community'}</span>
        <div className="event-art-date"><strong>{parts.day}</strong><span>{parts.month}</span></div>
        <div className="event-art-spark"><Icon name="sparkle" size={23} /></div>
      </div>
      <div className="event-card-content">
        <div className="event-time"><Icon name="clock" size={14} /> {parts.weekday}, {event.time || '10:00 AM'}</div>
        <h3>{event.title}</h3>
        {!compact && <p className="event-description">{event.description}</p>}
        <div className="event-meta-row"><span><Icon name="pin" size={15} />{event.location}</span><span className="attendee-count"><Icon name="users" size={15} />{attendeeCount}{capacity ? ` / ${capacity}` : ''} going</span></div>
        {full && !registered && <p className="event-full-note">This event is full.</p>}
        {error && <p className="form-error event-inline-error">{error}</p>}
        <div className="event-card-footer">
          <div className="event-organizer"><span className="mini-avatar">{(event.organizer?.name || 'C').slice(0, 1)}</span><span>{event.organizer?.name || 'Campus community'}</span></div>
          <div className="event-card-actions">
            {canManage && <button className="event-remove-action" onClick={remove} disabled={busy}>Remove</button>}
            <button className={'button ' + (registered ? 'button-attending' : 'button-primary') + ' button-small'} onClick={toggleRegistration} disabled={busy || (!registered && past) || (!registered && full && !API_URL)}>
              {busy ? 'Saving…' : registered ? <><Icon name="check" size={15} /> Going</> : past ? 'Registration closed' : full ? (API_URL ? 'Check availability' : 'Event full') : 'Join event'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}


