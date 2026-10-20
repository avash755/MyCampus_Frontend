import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import Icon from './Icon';

const tones = ['violet', 'peach', 'mint', 'blue'];

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
  const { registerEvent } = useWorkspace();
  const [busy, setBusy] = useState(false);
  const attendees = event.attendees || [];
  const registered = attendees.some((person) => (person?.id || person?._id || person) === user?.id);
  const parts = getParts(event.date);
  const tone = tones.includes(event.coverTone) ? event.coverTone : 'violet';

  async function toggleRegistration() {
    setBusy(true);
    try { await registerEvent(event); }
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
        <div className="event-meta-row"><span><Icon name="pin" size={15} />{event.location}</span><span className="attendee-count"><Icon name="users" size={15} />{attendees.length} going</span></div>
        <div className="event-card-footer">
          <div className="event-organizer"><span className="mini-avatar">{(event.organizer?.name || 'C').slice(0, 1)}</span><span>{event.organizer?.name || 'Campus community'}</span></div>
          <button className={'button ' + (registered ? 'button-attending' : 'button-primary') + ' button-small'} onClick={toggleRegistration} disabled={busy}>
            {busy ? 'Saving…' : registered ? <><Icon name="check" size={15} /> Going</> : 'Join event'}
          </button>
        </div>
      </div>
    </article>
  );
}