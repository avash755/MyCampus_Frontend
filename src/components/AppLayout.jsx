import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import Icon from './Icon';
import { campusAvatarColor } from '../utils/avatarColor';

const navigation = [
  { label: 'Overview', to: '/app', icon: 'grid', end: true, group: 'YOUR CAMPUS' },
  { label: 'Events', to: '/app/events', icon: 'calendar' },
  { label: 'Skill modules', to: '/app/modules', icon: 'book' },
  { label: 'Study resources', to: '/app/resources', icon: 'book' },
  { label: 'Lost & found', to: '/app/lost-found', icon: 'pin' },
  { label: 'Opportunities', to: '/app/opportunities', icon: 'briefcase', group: 'DISCOVER' },
  { label: 'Campus notices', to: '/app/notices', icon: 'bell' }
];

const pageNames = {
  '/app': 'Overview', '/app/events': 'Campus events', '/app/resources': 'Study resources',
  '/app/lost-found': 'Lost & found', '/app/opportunities': 'Opportunities',
  '/app/notices': 'Campus notices', '/app/moderation': 'Post moderation', '/app/profile': 'My profile', '/app/search': 'Search MyCampus', '/app/modules': 'Skill modules', '/app/modules/manage': 'Manage modules'
};

const categoryRoutes = {
  resource: '/app/resources',
  'lost-found': '/app/lost-found',
  opportunity: '/app/opportunities',
  notice: '/app/notices'
};

function notificationTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const { notifications, unreadNotifications, markNotificationRead, markAllNotificationsRead } = useWorkspace();
  const pendingAdminNotifications = user?.role === 'admin' ? notifications.filter((item) => item.type === 'post_pending' && !item.readAt).length : 0;
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const avatarColor = user?.role === 'admin' ? '#08754f' : campusAvatarColor(user?.avatarColor);
  const heading = pageNames[location.pathname] || (location.pathname.startsWith('/app/members/') ? 'Member profile' : 'MyCampus');
  const visibleNavigation = user?.role === 'admin'
    ? [...navigation, { label: 'Post moderation', to: '/app/moderation', icon: 'shield', group: 'ADMINISTRATION' }, { label: 'Manage modules', to: '/app/modules/manage', icon: 'calendar' }]
    : navigation;

  function submitSearch(event) {
    event.preventDefault();
    if (query.trim()) navigate('/app/search?q=' + encodeURIComponent(query.trim()));
  }

  function openNotification(notification) {
    setNotificationsOpen(false);
    if (notification.type === 'post_pending') navigate('/app/moderation');
    else navigate(categoryRoutes[notification.postCategory] || '/app');
    if (!notification.readAt) {
      markNotificationRead(notification._id).catch((err) => console.error('Could not mark notification as read:', err));
    }
  }

  async function readAllNotifications() {
    try { await markAllNotificationsRead(); }
    catch (err) { console.error('Could not mark notifications as read:', err); }
  }

  return (
    <div className="workspace">
      {mobileOpen && <button className="mobile-shade" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={'sidebar ' + (mobileOpen ? 'sidebar-open' : '')}>
        <NavLink to="/app" className="brand-lockup" onClick={() => setMobileOpen(false)}>
          <span className="brand-mark"><Icon name="compass" size={20} /></span>
          <span className="brand-word">mycampus<span>.</span></span>
        </NavLink>
        <div className="campus-switcher">
          <div className="campus-avatar">C</div>
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
                {item.label === 'Post moderation' && pendingAdminNotifications > 0 && <span className="nav-notification-count">{pendingAdminNotifications > 99 ? '99+' : pendingAdminNotifications}</span>}
              </NavLink>
            </div>
          ))}
        </nav>
        <div className="sidebar-note"><span className="sidebar-note-icon"><Icon name="sparkle" size={17} /></span><p><strong>Good things happen here.</strong><br />Your campus, a little closer.</p></div>
        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <NavLink to="/app/profile" className="sidebar-profile-link">
              <span className="avatar avatar-small" style={{ '--avatar-color': avatarColor }}>{user?.profileImage ? <img src={user.profileImage} alt="" /> : (user?.name?.slice(0, 1) || 'A')}</span>
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
            <div className="notification-menu">
              <button className="topbar-notification icon-button" aria-label={unreadNotifications ? `Notifications, ${unreadNotifications} unread` : 'Notifications'} aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}>
                <Icon name="bell" size={19} />
                {unreadNotifications > 0 && <span className="notification-count">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>}
              </button>
              {notificationsOpen && <section className="notification-panel" aria-label="Notifications">
                <div className="notification-panel-heading"><div><strong>Notifications</strong><span>{unreadNotifications ? `${unreadNotifications} unread` : 'You are all caught up'}</span></div>{unreadNotifications > 0 && <button type="button" onClick={readAllNotifications}>Mark all read</button>}</div>
                {notifications.length ? <div className="notification-list">{notifications.map((notification) => <button type="button" key={notification._id} className={'notification-item ' + (notification.readAt ? '' : 'notification-unread')} onClick={() => openNotification(notification)}>
                  <span className={'notification-symbol ' + (notification.type === 'post_pending' ? 'notification-symbol-admin' : '')}><Icon name={notification.type === 'post_pending' ? 'shield' : 'bell'} size={16} /></span>
                  <span className="notification-copy"><strong>{notification.type === 'post_pending' ? 'Post awaiting review' : notification.type === 'post_approved' ? 'Post approved' : 'Post needs changes'}</strong><span>{notification.message}</span><small>{notification.postTitle} · {notificationTime(notification.createdAt)}</small></span>
                  {!notification.readAt && <i aria-label="Unread" />}
                </button>)}</div> : <div className="notification-empty"><Icon name="bell" size={22} /><p>Post updates and review requests will show here.</p></div>}
              </section>}
            </div>
            <button className="topbar-user" onClick={() => navigate('/app/profile')} aria-label="Open profile"><span className="avatar avatar-top" style={{ '--avatar-color': avatarColor }}>{user?.profileImage ? <img src={user.profileImage} alt="" /> : (user?.name?.slice(0, 1) || 'A')}</span></button>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  );
}
