import { useMemo, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import EventCard from '../components/EventCard';
import EventForm from '../components/EventForm';
import Icon from '../components/Icon';

const categories = ['All', 'Workshop', 'Community', 'Career', 'Social', 'Academic'];
const statuses = ['All', 'Active', 'Closed'];

function isJoinable(event, now) {
  if (new Date(event.startsAt || event.date) <= now) return false;
  const capacity = Number(event.capacity) || null;
  const count = Number(event.attendeeCount ?? 0);
  return !capacity || count < capacity;
}

export default function EventsPage() {
  const { events, eventHasMore, loadingMoreEvents, loadMoreEvents } = useWorkspace();
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const now = new Date();
    return events
      .filter((event) => category === 'All' || event.category === category)
      .filter((event) => status === 'All' || (status === 'Active' ? isJoinable(event, now) : !isJoinable(event, now)))
      .filter((event) => (event.title + ' ' + event.location + ' ' + (event.description || '')).toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const aOpen = isJoinable(a, now);
        const bOpen = isJoinable(b, now);
        if (aOpen !== bOpen) return aOpen ? -1 : 1;
        const difference = new Date(a.date) - new Date(b.date);
        return aOpen ? difference : -difference;
      });
  }, [events, category, status, query]);

  return (
    <div className="listing-page">
      <section className="page-intro"><div><span className="section-eyebrow">FIND YOUR NEXT CAMPUS MOMENT</span><h1>There is always something <em>happening.</em></h1><p>Workshops, meetups, and little moments worth showing up for.</p></div><button className="button button-primary" onClick={() => setCreateOpen(true)}><Icon name="plus" size={17} /> Create an event</button></section>
      <div className="list-toolbar event-list-toolbar">
        <div className="event-filter-groups">
          <div className="event-filter-line event-filter-category"><span className="event-filter-label">CATEGORY</span><div className="filter-pills">{categories.map((item) => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)} className={'filter-pill ' + (category === item ? 'filter-pill-active' : '')}>{item}</button>)}</div></div>
          <div className="event-filter-line event-filter-status"><span className="event-filter-label">STATUS</span><div className="filter-pills">{statuses.map((item) => <button key={item} aria-pressed={status === item} onClick={() => setStatus(item)} className={'filter-pill ' + (status === item ? 'filter-pill-active' : '')}>{item}</button>)}</div></div>
        </div>
        <label className="inline-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an event" /></label>
      </div>
      {visible.length ? <div className="events-grid">{visible.map((event) => <EventCard key={event._id} event={event} />)}</div> : <div className="empty-panel"><span className="empty-icon"><Icon name="calendar" /></span><h3>No events found</h3><p>{status === 'Active' ? 'There are no events currently open for registration.' : 'Try another filter, or be the first to add something to the calendar.'}</p><button className="button button-primary" onClick={() => setCreateOpen(true)}><Icon name="plus" size={16} /> Create an event</button></div>}
      {eventHasMore && <div className="load-more-row"><button className="button button-quiet" disabled={loadingMoreEvents} onClick={loadMoreEvents}>{loadingMoreEvents ? 'Loading…' : 'Load more events'}</button></div>}
      {createOpen && <EventForm onClose={() => setCreateOpen(false)} />}
    </div>
  );
}
