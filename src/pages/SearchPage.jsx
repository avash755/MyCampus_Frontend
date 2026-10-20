import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import EventCard from '../components/EventCard';
import PostCard from '../components/PostCard';
import Icon from '../components/Icon';

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = (params.get('q') || '').trim().toLowerCase();
  const { events, posts } = useWorkspace();
  const matchingEvents = useMemo(() => events.filter((event) => (event.title + ' ' + event.description + ' ' + event.location).toLowerCase().includes(query)), [events, query]);
  const matchingPosts = useMemo(() => posts.filter((post) => (post.title + ' ' + post.body + ' ' + (post.tags || []).join(' ')).toLowerCase().includes(query)), [posts, query]);

  return (
    <div className="listing-page search-page">
      <section className="page-intro"><div><span className="section-eyebrow">LOOKING FOR SOMETHING?</span><h1>Search your <em>campus.</em></h1><p>Results for <strong>“{params.get('q') || ''}”</strong></p></div></section>
      {!query ? <div className="empty-panel"><span className="empty-icon"><Icon name="search" /></span><h3>Type something to search</h3><p>Try a course, an event, a place, or a topic.</p></div> : <>
        <div className="content-heading-row search-result-heading"><div><span className="section-eyebrow">EVENTS · {matchingEvents.length}</span><h2>Campus events</h2></div><Link className="text-action" to="/app/events">Browse all <Icon name="arrow" size={15} /></Link></div>
        {matchingEvents.length ? <div className="events-grid search-event-grid">{matchingEvents.map((event) => <EventCard key={event._id} event={event} compact />)}</div> : <p className="search-none">No events matched your search.</p>}
        <div className="content-heading-row search-result-heading"><div><span className="section-eyebrow">COMMUNITY POSTS · {matchingPosts.length}</span><h2>Resources & updates</h2></div><Link className="text-action" to="/app/resources">Study resources <Icon name="arrow" size={15} /></Link></div>
        {matchingPosts.length ? <div className="posts-grid">{matchingPosts.map((post) => <PostCard key={post._id} post={post} />)}</div> : <p className="search-none">No posts matched your search.</p>}
      </>}
    </div>
  );
}