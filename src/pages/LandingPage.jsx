import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

const features = [
  { icon: 'book', tone: 'feature-lilac', title: 'Skill modules', text: 'Explore upcoming sessions, request a place, track approval, and join the group after acceptance.' },
  { icon: 'calendar', tone: 'feature-peach', title: 'Campus events', text: 'Discover events, see whether registration is open, and register in a few clicks.' },
  { icon: 'file', tone: 'feature-mint', title: 'Study resources', text: 'Share and find class notes, useful links, and learning materials with students.' },
  { icon: 'pin', tone: 'feature-peach', title: 'Lost & found', text: 'Post a lost or found item so other students can help reunite it with its owner.' },
  { icon: 'briefcase', tone: 'feature-lilac', title: 'Opportunities', text: 'Browse internships and other listings shared by the campus community.' },
  { icon: 'bell', tone: 'feature-mint', title: 'Campus notices', text: 'Find campus updates and notices published by administrators.' },
  { icon: 'users', tone: 'feature-peach', title: 'Module group chat', text: 'Accepted students and administrators can discuss a module in its private group.' }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const featureViewportRef = useRef(null);
  const [featureIndex, setFeatureIndex] = useState(0);
  const [featureLayout, setFeatureLayout] = useState({ step: 0, visibleCount: 3 });
  const sampleEventDates = [2, 5].map((daysAhead) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return { day: date.getDate(), month: date.toLocaleDateString('en', { month: 'short' }).toUpperCase() };
  });

  useEffect(() => {
    const viewport = featureViewportRef.current;
    if (!viewport) return undefined;

    const measure = () => {
      const firstCard = viewport.querySelector('.feature-card');
      const track = viewport.querySelector('.feature-grid');
      if (!firstCard || !track || !viewport.clientWidth) return;
      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
      const step = firstCard.getBoundingClientRect().width + gap;
      const visibleCount = Math.max(1, Math.round((viewport.clientWidth + gap) / step));
      setFeatureLayout({ step, visibleCount });
      setFeatureIndex((current) => Math.min(current, features.length - visibleCount));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const maxFeatureIndex = Math.max(0, features.length - featureLayout.visibleCount);
  const visibleFeatureEnd = Math.min(features.length, featureIndex + featureLayout.visibleCount);

  function moveFeature(direction) {
    setFeatureIndex((current) => Math.max(0, Math.min(maxFeatureIndex, current + direction)));
  }

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Link to="/" className="brand-lockup"><span className="brand-mark"><Icon name="compass" size={20} /></span><span className="brand-word">mycampus<span>.</span></span></Link>
        <nav className="landing-nav-links"><a href="#what-is-mycampus">What is MyCampus</a><a href="#features">Features</a></nav>
        <div className="landing-nav-actions"><Link className="landing-signin" to="/login">Sign in</Link><button className="button button-primary" onClick={() => navigate('/preview')}>Explore MyCampus <Icon name="arrow" size={16} /></button></div>
      </header>

      <main>
        <section className="landing-hero" id="what-is-mycampus">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> YOUR CAMPUS · YOUR COMMUNITY</div>
            <h1>Campus life,<br /><em>all together.</em></h1>
            <p>Skill modules, campus events, resources, and updates—together in one place for students.</p>
            <div className="hero-actions"><button className="button button-primary button-large" onClick={() => navigate('/preview')}>Take a look around <Icon name="arrow" size={17} /></button><a className="hero-text-link" href="#features"><span className="play-circle">↓</span> See what you can do</a></div>
            <div className="hero-proof"><div className="avatar-stack"><span>A</span><span>M</span><span>J</span><span>+2</span></div><div><strong>A home for campus life</strong><small>Made to bring useful things closer</small></div></div>
          </div>

          <div className="hero-art">
            <div className="hero-spark hero-spark-one">✳</div><div className="hero-spark hero-spark-two">✦</div><div className="hero-blob" />
            <div className="mock-window">
              <div className="mock-window-top"><div className="mock-brand"><span className="mock-brand-mark">◈</span> mycampus</div><div className="mock-dots"><i /><i /><i /></div></div>
              <div className="mock-greeting"><div><small>YOUR CAMPUS, ALL TOGETHER</small><h3>A little more connected.</h3></div><span className="mock-user">A</span></div>
              <div className="mock-search"><Icon name="search" size={15} /> Find your next campus moment</div>
              <div className="mock-stat-row">
                <div className="mock-stat"><span className="mock-stat-icon mock-violet"><Icon name="calendar" size={15} /></span><small>Events this week</small><strong>08</strong></div>
                <div className="mock-stat"><span className="mock-stat-icon mock-peach"><Icon name="book" size={15} /></span><small>Shared resources</small><strong>24</strong></div>
                <div className="mock-stat"><span className="mock-stat-icon mock-mint"><Icon name="users" size={15} /></span><small>Campus members</small><strong>1.2k</strong></div>
              </div>
              <div className="mock-section-head"><strong>Coming up</strong><span>See all <Icon name="arrow" size={12} /></span></div>
              <div className="mock-event-row"><span className="mock-event-date">{sampleEventDates[0].day}<br /><small>{sampleEventDates[0].month}</small></span><div><strong>Designing for a better campus</strong><small>Innovation Lab · 2:30 PM</small></div><span className="mock-event-tag">WORKSHOP</span></div>
              <div className="mock-event-row"><span className="mock-event-date mock-date-peach">{sampleEventDates[1].day}<br /><small>{sampleEventDates[1].month}</small></span><div><strong>Campus welcome social</strong><small>Central Green · 5:00 PM</small></div><span className="mock-event-tag mock-tag-peach">SOCIAL</span></div>
            </div>
            <div className="floating-note"><span className="floating-note-icon"><Icon name="sparkle" size={18} /></span><span><strong>Good things are happening</strong><small>Find your next thing</small></span></div>
          </div>
        </section>

        <section className="landing-ribbon"><span>Less searching, more belonging</span><i /><span>Made for the everyday campus</span><i /><span>One place to find your people</span></section>

        <section className="landing-features" id="features">
          <div className="section-heading"><div className="eyebrow"><span className="eyebrow-dot" /> A BETTER CAMPUS DAY</div><h2>Find a little more<br /><em>of what matters.</em></h2><p>Campus is full of good things. MyCampus makes it easier to find them.</p></div>
          <div className="feature-carousel">
            <div className="feature-viewport" ref={featureViewportRef} role="region" aria-label="MyCampus features" aria-roledescription="carousel" tabIndex={0} onKeyDown={(event) => { if (event.key === 'ArrowLeft') moveFeature(-1); if (event.key === 'ArrowRight') moveFeature(1); }}>
              <div className="feature-grid" style={{ transform: `translate3d(-${featureIndex * featureLayout.step}px, 0, 0)` }}>
                {features.map((feature, index) => {
                  const isVisible = index >= featureIndex && index < visibleFeatureEnd;
                  return <article className="feature-card" key={feature.title} aria-hidden={!isVisible}><span className={'feature-icon ' + feature.tone}><Icon name={feature.icon} size={20} /></span><span className="feature-number">{String(index + 1).padStart(2, '0')}</span><h3>{feature.title}</h3><p>{feature.text}</p><button className="feature-arrow" tabIndex={isVisible ? 0 : -1} aria-label={'Explore ' + feature.title} onClick={() => navigate('/preview')}><Icon name="arrow" size={17} /></button></article>;
                })}
              </div>
            </div>
            <div className="feature-carousel-controls">
              <span className="feature-carousel-count" aria-live="polite">{String(Math.min(featureIndex + 1, features.length)).padStart(2, '0')}–{String(visibleFeatureEnd).padStart(2, '0')} <span>/ {String(features.length).padStart(2, '0')}</span></span>
              <div className="feature-carousel-buttons"><button type="button" className="feature-carousel-button is-previous" aria-label="Show previous features" onClick={() => moveFeature(-1)} disabled={featureIndex === 0}><Icon name="arrow" size={18} /></button><button type="button" className="feature-carousel-button" aria-label="Show more features" onClick={() => moveFeature(1)} disabled={featureIndex >= maxFeatureIndex}><Icon name="arrow" size={18} /></button></div>
            </div>
          </div>
        </section>

        <section className="landing-cta"><div className="cta-orbit cta-orbit-one" /><div className="cta-orbit cta-orbit-two" /><div className="cta-content"><span className="cta-star">✳</span><h2>There is a place<br />for you here.</h2><p>Take a look around your campus community.</p><button className="button button-light button-large" onClick={() => navigate('/preview')}>Take a look around <Icon name="arrow" size={17} /></button></div><div className="cta-aside"><span>MYCAMPUS</span><strong>Made for students.<br />Built for belonging.</strong><small>Campus life, together.</small></div></section>
      </main>

      <footer className="landing-footer"><Link to="/" className="brand-lockup"><span className="brand-mark"><Icon name="compass" size={20} /></span><span className="brand-word">mycampus<span>.</span></span></Link><span>A community space for students</span><a href="#what-is-mycampus">Back to top ↑</a></footer>
    </div>
  );
}
