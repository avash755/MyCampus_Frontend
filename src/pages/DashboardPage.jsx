import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import EventCard from '../components/EventCard';
import MetricCard from '../components/MetricCard';
import PostCard from '../components/PostCard';
import Icon from '../components/Icon';

function dayPart() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { events, posts, loading } = useWorkspace();
  const upcoming = useMemo(() => [...events].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 2), [events]);
  const featuredResource = posts.find((post) => post.category === 'resource');
  const notice = posts.find((post) => post.category === 'notice');
  const resourceCount = posts.filter((post) => post.category === 'resource').length;
  const opportunityCount = posts.filter((post) => post.category === 'opportunity').length;
  const lostCount = posts.filter((post) => post.category === 'lost-found').length;

  return (
    <div className="dashboard-page">
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="welcome-kicker"><span /> YOUR CAMPUS IS IN FULL SWING</span>
          <h1>{dayPart()}, {user?.name?.split(' ')[0] || 'there'}<span>.</span></h1>
          <p>A little look at what is happening around campus.</p>
          <Link to="/app/events" className="welcome-link">Explore this week <Icon name="arrow" size={15} /></Link>
        </div>
        <div className="welcome-illustration" aria-hidden="true">
          <div className="welcome-sun" /><div className="welcome-shape welcome-shape-one" /><div className="welcome-shape welcome-shape-two" />
          <div className="welcome-book"><span /><span /><span /></div><div className="welcome-plant"><i /><i /><b /></div>
          <span className="welcome-star">✦</span><span className="welcome-star welcome-star-two">✳</span>
        </div>
        <span className="banner-index">01 / CAMPUS PULSE</span>
      </section>

      <div className="dashboard-section-top"><div><span className="section-eyebrow">A QUICK SNAPSHOT</span><h2>Your campus, at a glance</h2></div><span className="updated-indicator"><i /> Updates as things happen</span></div>
      <section className="metric-grid">
        <MetricCard label="Events coming up" value={events.length.toString().padStart(2, '0')} helper="Find something to join" icon="calendar" tone="lavender" />
        <MetricCard label="Study resources" value={resourceCount.toString().padStart(2, '0')} helper="Shared by your community" icon="book" tone="peach" />
        <MetricCard label="Opportunities" value={opportunityCount.toString().padStart(2, '0')} helper="Explore what is out there" icon="briefcase" tone="mint" />
        <MetricCard label="Lost & found" value={lostCount.toString().padStart(2, '0')} helper="Help something get home" icon="pin" tone="blue" />
      </section>

      <div className="dashboard-content-grid">
        <section className="dashboard-main-column">
          <div className="content-heading-row"><div><span className="section-eyebrow">PUT IT ON YOUR CALENDAR</span><h2>Coming up on campus</h2></div><Link className="text-action" to="/app/events">All events <Icon name="arrow" size={15} /></Link></div>
          {loading && !events.length ? <div className="skeleton-card" /> : upcoming.length ? <div className="dashboard-event-grid">{upcoming.map((event) => <EventCard key={event._id} event={event} compact />)}</div> : <div className="empty-state"><span className="empty-icon"><Icon name="calendar" /></span><strong>No events posted yet</strong><p>Check back soon for something happening on campus.</p></div>}

          <div className="content-heading-row resources-heading-row"><div><span className="section-eyebrow">PASS IT ON</span><h2>A good resource to know</h2></div><Link className="text-action" to="/app/resources">Explore resources <Icon name="arrow" size={15} /></Link></div>
          {featuredResource ? <PostCard post={featuredResource} /> : <div className="empty-state"><span className="empty-icon"><Icon name="book" /></span><strong>Share the first resource</strong><p>Help someone else find something useful.</p></div>}
        </section>

        <aside className="dashboard-side-column">
          <section className="notice-card">
            <div className="notice-card-top"><span className="notice-icon"><Icon name="bell" size={17} /></span><span className="notice-label">A CAMPUS NOTE</span><Link to="/app/notices" aria-label="All campus notices"><Icon name="arrow" size={16} /></Link></div>
            {notice ? <><h3>{notice.title}</h3><p>{notice.body}</p><span className="notice-author">From {notice.author?.name || 'Student Affairs'}</span></> : <><h3>Make campus updates easier to find.</h3><p>Notices shared by your campus community will show up here.</p></>}
          </section>
          <section className="quick-links-card">
            <div className="quick-links-heading"><span className="section-eyebrow">A GOOD PLACE TO START</span><h3>Find your next thing</h3></div>
            <Link to="/app/resources" className="quick-link"><span className="quick-link-icon quick-icon-violet"><Icon name="bookOpen" size={17} /></span><span><strong>Study resources</strong><small>Notes, guides & helpful links</small></span><Icon name="arrow" size={15} /></Link>
            <Link to="/app/opportunities" className="quick-link"><span className="quick-link-icon quick-icon-peach"><Icon name="briefcase" size={17} /></span><span><strong>Opportunities</strong><small>Listings from organizations</small></span><Icon name="arrow" size={15} /></Link>
            <Link to="/app/lost-found" className="quick-link"><span className="quick-link-icon quick-icon-mint"><Icon name="pin" size={17} /></span><span><strong>Lost & found</strong><small>Help an item find its way</small></span><Icon name="arrow" size={15} /></Link>
          </section>
          <div className="gentle-reminder"><span>✳</span><p>A small hello can turn into a good campus day.</p></div>
        </aside>
      </div>
    </div>
  );
}