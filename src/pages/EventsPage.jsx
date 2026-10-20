import { useMemo, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import EventCard from '../components/EventCard';
import EventForm from '../components/EventForm';
import Icon from '../components/Icon';

const filters = ['All', 'Workshop', 'Community', 'Career', 'Social', 'Academic'];

export default function EventsPage() {
  const { events } = useWorkspace();
  const [active, setActive] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => events
    .filter((event) => active === 'All' || event.category === active)
    .filter((event) => (event.title + ' ' + event.location).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => new Date(a.date) - new Date(b.date)), [events, active, query]);

  return (
    <div className="listing-page">
      <section className="page-intro"><div><span className="section-eyebrow">FIND YOUR NEXT CAMPUS MOMENT</span><h1>There is always something <em>happening.</em></h1><p>Workshops, meetups, and little moments worth showing up for.</p></div><button className="button button-primary" onClick={() => setCreateOpen(true)}><Icon name="plus" size={17} /> Create an event</button></section>
      <div className="list-toolbar"><div className="filter-pills">{filters.map((filter) => <button key={filter} onClick={() => setActive(filter)} className={'filter-pill ' + (active === filter ? 'filter-pill-active' : '')}>{filter}</button>)}</div><label className="inline-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an event" /></label></div>
      {visible.length ? <div className="events-grid">{visible.map((event) => <EventCard key={event._id} event={event} />)}</div> : <div className="empty-panel"><span className="empty-icon"><Icon name="calendar" /></span><h3>No events found</h3><p>Try another filter, or be the first to add something to the calendar.</p><button className="button button-primary" onClick={() => setCreateOpen(true)}><Icon name="plus" size={16} /> Create an event</button></div>}
      {createOpen && <EventForm onClose={() => setCreateOpen(false)} />}
    </div>
  );
}