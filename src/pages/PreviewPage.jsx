import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import MetricCard from '../components/MetricCard';
import PostCard from '../components/PostCard';
import { previewEvents, previewNotice, previewPosts, previewStats } from '../data/previewData';

function SampleEventCard({ event }) {
  const date = new Date(event.date);
  const day = date.toLocaleDateString('en', { day: '2-digit' });
  const month = date.toLocaleDateString('en', { month: 'short' }).toUpperCase();
  const weekday = date.toLocaleDateString('en', { weekday: 'short' });

  return (
    <article className="event-card preview-event-card">
      <div className={'event-art event-art-' + event.coverTone}>
        <div className="event-art-orbit event-art-orbit-one" /><div className="event-art-orbit event-art-orbit-two" />
        <span className="event-art-category">{event.category}</span>
        <div className="event-art-date"><strong>{day}</strong><span>{month}</span></div>
        <div className="event-art-spark"><Icon name="sparkle" size={23} /></div>
      </div>
      <div className="event-card-content">
        <div className="event-time"><Icon name="clock" size={14} /> {weekday}, {event.time}</div>
        <h3>{event.title}</h3>
        <p className="event-description">{event.description}</p>
        <div className="event-meta-row"><span><Icon name="pin" size={15} />{event.location}</span><span><Icon name="users" size={15} />{event.attendeeCount} / {event.capacity} interested</span></div>
        <div className="event-card-footer">
          <div className="event-organizer"><span className="mini-avatar">{event.organizer.name.slice(0, 1)}</span><span>{event.organizer.name}</span></div>
          <Link className="button button-primary button-small" to="/login?mode=signup">Sign up to join</Link>
        </div>
      </div>
    </article>
  );
}

export default function PreviewPage() {
  const resource = previewPosts.find((post) => post.category === 'resource');
  const opportunity = previewPosts.find((post) => post.category === 'opportunity');
  const lostFound = previewPosts.find((post) => post.category === 'lost-found');

  return (
    <div className="landing-page preview-shell">
      <header className="landing-nav preview-nav">
        <Link to="/" className="brand-lockup"><span className="brand-mark"><Icon name="compass" size={21} /></span><span className="brand-word">mycampus<span>.</span></span></Link>
        <span className="preview-nav-label"><span /> SAMPLE PREVIEW</span>
        <div className="landing-nav-actions"><Link className="landing-signin" to="/login">Sign in</Link><Link className="button button-primary" to="/login?mode=signup">Create account <Icon name="arrow" size={16} /></Link></div>
      </header>

      <main className="preview-main">
        <section className="preview-heading page-intro">
          <div><span className="section-eyebrow">A READ-ONLY LOOK AROUND</span><h1>Campus life, <em>all together.</em></h1><p>Explore sample events, resources, opportunities, and campus updates. Create an account to use real campus data.</p></div>
          <Link className="button button-primary" to="/login?mode=signup">Create your account <Icon name="arrow" size={16} /></Link>
        </section>

        <div className="preview-disclaimer"><Icon name="sparkle" size={16} /><span><strong>Sample content:</strong> These example events and posts are for exploring the site. Nothing here is saved or registered.</span></div>

        <section className="metric-grid preview-metric-grid" aria-label="Sample campus activity">
          {previewStats.map((stat) => <MetricCard key={stat.label} {...stat} />)}
        </section>

        <div className="dashboard-content-grid preview-content-grid">
          <section className="dashboard-main-column">
            <div className="content-heading-row"><div><span className="section-eyebrow">PUT IT ON YOUR CALENDAR</span><h2>Coming up on campus</h2></div><span className="preview-count">{previewEvents.length} sample events</span></div>
            <div className="preview-event-grid">{previewEvents.map((event) => <SampleEventCard key={event._id} event={event} />)}</div>

            <div className="content-heading-row resources-heading-row"><div><span className="section-eyebrow">PASS IT ON</span><h2>Things students are sharing</h2></div><Link className="text-action" to="/login?mode=signup">Share something <Icon name="arrow" size={15} /></Link></div>
            <div className="posts-grid preview-post-grid"><PostCard post={resource} /><PostCard post={opportunity} /><PostCard post={lostFound} /></div>
          </section>

          <aside className="dashboard-side-column">
            <section className="notice-card">
              <div className="notice-card-top"><span className="notice-icon"><Icon name="bell" size={17} /></span><span className="notice-label">A CAMPUS NOTE</span><span className="preview-sample-label">SAMPLE</span></div>
              <h3>{previewNotice.title}</h3><p>{previewNotice.body}</p><span className="notice-author">From {previewNotice.author.name}</span>
            </section>
            <section className="quick-links-card preview-join-card">
              <div className="quick-links-heading"><span className="section-eyebrow">READY TO JOIN IN?</span><h3>Make it your campus</h3></div>
              <p>Your account connects you to real events and posts saved by your campus community.</p>
              <Link className="button button-primary" to="/login?mode=signup">Create an account <Icon name="arrow" size={15} /></Link>
              <Link className="preview-signin-link" to="/login">Already have an account? Sign in</Link>
            </section>
            <div className="gentle-reminder"><span>✳</span><p>These names and listings are examples. Real content comes from your community.</p></div>
          </aside>
        </div>
      </main>
    </div>
  );
}
