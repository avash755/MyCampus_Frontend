import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

const navigation = [
  { label: 'Overview', to: '/app', icon: 'grid', end: true, group: 'YOUR CAMPUS' },
  { label: 'Events', to: '/app/events', icon: 'calendar' },
  { label: 'Study resources', to: '/app/resources', icon: 'book' },
  { label: 'Lost & found', to: '/app/lost-found', icon: 'pin' },
  { label: 'Opportunities', to: '/app/opportunities', icon: 'briefcase', group: 'DISCOVER' },
  { label: 'Campus notices', to: '/app/notices', icon: 'bell' }
];

const pageNames = {
  '/app': 'Overview', '/app/events': 'Campus events', '/app/resources': 'Study resources',
  '/app/lost-found': 'Lost & found', '/app/opportunities': 'Opportunities',
  '/app/notices': 'Campus notices', '/app/moderation': 'Post moderation', '/app/profile': 'My profile', '/app/search': 'Search MyCampus'
};

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const heading = pageNames[location.pathname] || 'MyCampus';
  const visibleNavigation = user?.role === 'admin'
    ? [...navigation, { label: 'Post moderation', to: '/app/moderation', icon: 'shield', group: 'ADMINISTRATION' }]
    : navigation;

  function submitSearch(event) {
    event.preventDefault();
    if (query.trim()) navigate('/app/search?q=' + encodeURIComponent(query.trim()));
  }

  return (
    <div className="workspace">
      {mobileOpen && <button className="mobile-shade" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={'sidebar ' + (mobileOpen ? 'sidebar-open' : '')}>
        <NavLink to="/app" className="brand-lockup" onClick={() => setMobileOpen(false)}>
          <span className="brand-mark"><Icon name="compass" size={21} /></span>
          <span className="brand-word">mycampus<span>.</span></span>
        </NavLink>
        <div className="campus-switcher">
          <div className="campus-avatar">N</div>
          <div className="campus-switch-copy"><strong>Your College</strong><span>Student community</span></div>
          <span className="switch-chevron">⌄</span>
        </div>
        <nav className="side-navigation" aria-label="Main navigation">
          {visibleNavigation.map((item, index) => (
            <div key={item.to}>
              {item.group && <p className={'nav-group-label ' + (index ? 'nav-group-spaced' : '')}>{item.group}</p>}
              <NavLink to={item.to} end={item.end} onClick={() => setMobileOpen(false)} className={({ isActive }) => 'nav-link ' + (isActive ? 'nav-link-active' : '')}>
                <Icon name={item.icon} size={18} /><span>{item.label}</span>
                {item.label === 'Campus notices' && <span className="nav-unread-dot" />}
              </NavLink>
            </div>
          ))}
        </nav>
        <div className="sidebar-note"><span className="sidebar-note-icon"><Icon name="sparkle" size={17} /></span><p><strong>Good things happen here.</strong><br />Your campus, a little closer.</p></div>
        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <NavLink to="/app/profile" className="sidebar-profile-link">
              <span className="avatar avatar-small" style={{ '--avatar-color': user?.avatarColor || '#6d65e8' }}>{user?.name?.slice(0, 1) || 'A'}</span>
              <span className="sidebar-user-copy"><strong>{user?.name || 'Campus member'}</strong><small>{user?.role === 'admin' ? 'Campus administrator' : user?.department || 'Student'}</small></span>
            </NavLink>
            <button className="profile-logout" title="Sign out" aria-label="Sign out" onClick={() => { signOut(); navigate('/'); }}><Icon name="logout" size={16} /></button>
          </div>
          <div className="sidebar-version">Made for your campus <span>✳</span></div>
        </div>
      </aside>
      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Icon name="menu" /></button>
            <div className="breadcrumb"><span>MyCampus</span><span className="breadcrumb-slash">/</span><strong>{heading}</strong></div>
          </div>
          <form className="global-search" onSubmit={submitSearch}>
            <Icon name="search" size={17} /><input aria-label="Search MyCampus" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything..." /><kbd>↵</kbd>
          </form>
          <div className="topbar-actions">
            <button className="topbar-notification icon-button" aria-label="Notifications" onClick={() => navigate('/app/notices')}><Icon name="bell" size={19} /><i /></button>
            <button className="topbar-user" onClick={() => navigate('/app/profile')} aria-label="Open profile"><span className="avatar avatar-top" style={{ '--avatar-color': user?.avatarColor || '#6d65e8' }}>{user?.name?.slice(0, 1) || 'A'}</span></button>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  );
}
