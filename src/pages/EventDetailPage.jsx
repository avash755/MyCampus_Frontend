import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { campusService } from '../services/campusService';
import EventChat from '../components/EventChat';
import Icon from '../components/Icon';

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    campusService.getEvent(id)
      .then((item) => { if (active) setEvent(item); })
      .catch((err) => { if (active) setError(err.message || 'Could not load this event.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="empty-panel"><p>Loading event…</p></div>;
  if (!event) return (
    <div className="empty-panel">
      <h3>Event unavailable</h3>
      <p>{error || 'This event may have been removed.'}</p>
      <Link className="text-action" to="/app/events">Back to events</Link>
    </div>
  );

  const eventDate = new Date(event.date);
  return (
    <div className="event-detail-page">
      <Link to="/app/events" className="module-back-link">← All events</Link>
      <section className="event-detail-hero">
        <div>
          <span className="event-detail-category">{event.category || 'Community'} EVENT</span>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
        </div>
        <div className="event-detail-date">
          <Icon name="calendar" size={19} />
          <strong>{eventDate.toLocaleDateString([], { dateStyle: 'medium' })}</strong>
          <span>{event.time || 'Time to be announced'}</span>
        </div>
      </section>

      <div className="event-detail-layout">
        <main className="event-detail-main">
          <section className="module-info-card event-detail-info">
            <div><span>Location</span><strong><Icon name="pin" size={16} />{event.location}</strong></div>
            <div><span>Going</span><strong><Icon name="users" size={16} />{event.attendeeCount || 0}{event.capacity ? ` / ${event.capacity}` : ''}</strong></div>
            <div><span>Organized by</span><strong>{event.organizer?.name || 'Campus community'}</strong></div>
          </section>
          <section className="event-discussion-section">
            <div className="event-discussion-heading">
              <div><span className="section-eyebrow">CAMPUS CONVERSATION</span><h2>Event group chat</h2></div>
              <p>Open to all signed-in students and administrators.</p>
            </div>
            <EventChat eventId={id} />
          </section>
        </main>
        <aside className="event-detail-aside">
          <div className="module-register-card">
            <span className="module-people-large"><Icon name="users" size={20} />{event.attendeeCount || 0}</span>
            <h2>Students going</h2>
            <p>The event group chat is available to every signed-in campus member, whether or not they have registered.</p>
            {event.organizer?.department && <p className="event-organizer-department">Organizer · {event.organizer.department}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
