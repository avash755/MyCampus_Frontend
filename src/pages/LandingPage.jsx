import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

const features = [
  { icon: 'calendar', tone: 'feature-lilac', title: 'Find your people', text: 'See what is happening around campus and save a seat for something you like.' },
  { icon: 'book', tone: 'feature-peach', title: 'Share what helps', text: 'Swap notes, useful links, and class resources with your campus community.' },
  { icon: 'pin', tone: 'feature-mint', title: 'Keep campus connected', text: 'Find a lost item, share a notice, or pass along an opportunity worth exploring.' }
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Link to="/" className="brand-lockup"><span className="brand-mark"><Icon name="compass" size={21} /></span><span className="brand-word">mycampus<span>.</span></span></Link>
        <nav className="landing-nav-links"><a href="#what-is-mycampus">What is MyCampus</a><a href="#features">Features</a></nav>
        <div className="landing-nav-actions"><Link className="landing-signin" to="/login">Sign in</Link><button className="button button-primary" onClick={() => navigate('/preview')}>Explore MyCampus <Icon name="arrow" size={16} /></button></div>
      </header>

      <main>
        <section className="landing-hero" id="what-is-mycampus">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> YOUR CAMPUS, A LITTLE CLOSER</div>
            <h1>Campus life,<br /><em>all together.</em></h1>
            <p>Events, helpful resources, campus updates, and opportunities—thoughtfully brought together in one friendly place.</p>
            <div className="hero-actions"><button className="button button-primary button-large" onClick={() => navigate('/preview')}>Take a look around <Icon name="arrow" size={17} /></button><a className="hero-text-link" href="#features"><span className="play-circle">↓</span> See what you can do</a></div>
            <div className="hero-proof"><div className="avatar-stack"><span>A</span><span>M</span><span>J</span><span>+2</span></div><div><strong>A home for campus life</strong><small>Made to bring useful things closer</small></div></div>
          </div>

          <div className="hero-art">
            <div className="hero-spark hero-spark-one">✳</div><div className="hero-spark hero-spark-two">✦</div><div className="hero-blob" />
            <div className="mock-window">
              <div className="mock-window-top"><div className="mock-brand"><span className="mock-brand-mark">◈</span> mycampus</div><div className="mock-dots"><i /><i /><i /></div></div>
              <div className="mock-greeting"><div><small>YOUR CAMPUS, OCTOBER 2026</small><h3>A little more connected.</h3></div><span className="mock-user">A</span></div>
              <div className="mock-search"><Icon name="search" size={15} /> Find your next campus moment</div>
              <div className="mock-stat-row">
                <div className="mock-stat"><span className="mock-stat-icon mock-violet"><Icon name="calendar" size={15} /></span><small>Events this week</small><strong>08</strong></div>
                <div className="mock-stat"><span className="mock-stat-icon mock-peach"><Icon name="book" size={15} /></span><small>Shared resources</small><strong>24</strong></div>
                <div className="mock-stat"><span className="mock-stat-icon mock-mint"><Icon name="users" size={15} /></span><small>Campus members</small><strong>1.2k</strong></div>
              </div>
              <div className="mock-section-head"><strong>Coming up</strong><span>See all <Icon name="arrow" size={12} /></span></div>
              <div className="mock-event-row"><span className="mock-event-date">21<br /><small>OCT</small></span><div><strong>Designing for a better campus</strong><small>Innovation Lab · 2:30 PM</small></div><span className="mock-event-tag">WORKSHOP</span></div>
              <div className="mock-event-row"><span className="mock-event-date mock-date-peach">24<br /><small>OCT</small></span><div><strong>Fall welcome social</strong><small>Central Green · 5:00 PM</small></div><span className="mock-event-tag mock-tag-peach">SOCIAL</span></div>
            </div>
            <div className="floating-note"><span className="floating-note-icon"><Icon name="sparkle" size={18} /></span><span><strong>Good things are happening</strong><small>Find your next thing</small></span></div>
          </div>
        </section>

        <section className="landing-ribbon"><span>Less searching, more belonging</span><i /><span>Made for the everyday campus</span><i /><span>One place to find your people</span></section>

        <section className="landing-features" id="features">
          <div className="section-heading"><div className="eyebrow"><span className="eyebrow-dot" /> A BETTER CAMPUS DAY</div><h2>Find a little more<br /><em>of what matters.</em></h2><p>Campus is full of good things. MyCampus makes it easier to find them.</p></div>
          <div className="feature-grid">{features.map((feature, index) => (
            <article className="feature-card" key={feature.title}><span className={'feature-icon ' + feature.tone}><Icon name={feature.icon} size={20} /></span><span className="feature-number">0{index + 1}</span><h3>{feature.title}</h3><p>{feature.text}</p><button className="feature-arrow" aria-label={'Explore ' + feature.title} onClick={() => navigate('/preview')}><Icon name="arrow" size={17} /></button></article>
          ))}</div>
        </section>

        <section className="landing-cta"><div className="cta-orbit cta-orbit-one" /><div className="cta-orbit cta-orbit-two" /><div className="cta-content"><span className="cta-star">✳</span><h2>There is a place<br />for you here.</h2><p>Take a look around your campus community.</p><button className="button button-light button-large" onClick={() => navigate('/preview')}>Take a look around <Icon name="arrow" size={17} /></button></div><div className="cta-aside"><span>MYCAMPUS</span><strong>Made for students.<br />Built for belonging.</strong><small>Campus life, together.</small></div></section>
      </main>

      <footer className="landing-footer"><Link to="/" className="brand-lockup"><span className="brand-mark"><Icon name="compass" size={18} /></span><span className="brand-word">mycampus<span>.</span></span></Link><span>Created by Emtayes Anwar Avash.</span><a href="#what-is-mycampus">Back to top ↑</a></footer>
    </div>
  );
}
