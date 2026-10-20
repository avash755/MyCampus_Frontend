import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import Icon from '../components/Icon';

export default function ProfilePage() {
  const { user } = useAuth();
  const { events, posts } = useWorkspace();
  const joined = events.filter((event) => (event.attendees || []).some((person) => (person?.id || person?._id || person) === user?.id));
  const shared = posts.filter((post) => (post.author?.id || post.author?._id) === user?.id || post.author?.name === user?.name);

  return (
    <div className="profile-page">
      <section className="page-intro"><div><span className="section-eyebrow">YOUR MYCAMPUS SPACE</span><h1>A little space <em>for you.</em></h1><p>Keep your campus details close and see what you have been part of.</p></div></section>
      <div className="profile-layout">
        <section className="profile-card">
          <div className="profile-cover"><span className="profile-cover-shape" /><span className="profile-cover-mark">✳</span></div>
          <div className="profile-avatar-large" style={{ '--avatar-color': user?.avatarColor || '#6d65e8' }}>{user?.name?.slice(0, 1) || 'A'}</div>
          <div className="profile-card-body"><span className="profile-role-pill"><Icon name={user?.role === 'admin' ? 'shield' : 'sparkle'} size={14} />{user?.role === 'admin' ? 'Campus administrator' : 'Campus member'}</span><h2>{user?.name}</h2><p>{user?.department || 'Your campus community'}</p>
            <div className="profile-info-list"><div><span>Email</span><strong>{user?.email}</strong></div><div><span>Student ID</span><strong>{user?.studentId || 'Not added'}</strong></div><div><span>Department</span><strong>{user?.department || 'Not added'}</strong></div></div>
          </div>
        </section>
        <section className="profile-activity">
          <div className="profile-activity-heading"><span className="section-eyebrow">YOUR CAMPUS ACTIVITY</span><h2>A few things you are part of.</h2></div>
          <div className="activity-stat-row"><div><strong>{joined.length}</strong><span>Events joined</span></div><div><strong>{shared.length}</strong><span>Posts shared</span></div></div>
          <h3 className="activity-subtitle">Events you joined</h3>
          {joined.length ? joined.map((event) => <div className="activity-row" key={event._id}><span className="activity-calendar"><Icon name="calendar" size={17} /></span><span><strong>{event.title}</strong><small>{new Date(event.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })} · {event.location}</small></span><Icon name="arrow" size={15} /></div>) : <div className="activity-empty">You have not joined an event yet. <a href="/app/events">Find one to join →</a></div>}
        </section>
      </div>
    </div>
  );
}