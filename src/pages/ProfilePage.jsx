import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import Icon from '../components/Icon';
import Modal from '../components/Modal';

const getId = (value) => String(value?.id || value?._id || value || '');

export default function ProfilePage() {
  const { user, updateProfile, deleteProfile } = useAuth();
  const { events, posts } = useWorkspace();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '', studentId: user?.studentId || '' });
  const [password, setPassword] = useState('');
  const joined = events.filter((event) => (event.attendees || []).some((person) => getId(person) === getId(user)));
  const shared = posts.filter((post) => getId(post.author) === getId(user));

  async function save(event) {
    event.preventDefault(); setSaving(true); setError('');
    try { await updateProfile(form); setEditOpen(false); }
    catch (err) { setError(err.message || 'Could not update your profile.'); }
    finally { setSaving(false); }
  }

  async function removeAccount(event) {
    event.preventDefault(); setSaving(true); setError('');
    try { await deleteProfile(password); navigate('/login', { replace: true }); }
    catch (err) { setError(err.message || 'Could not delete your profile.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="profile-page">
      <section className="page-intro"><div><span className="section-eyebrow">YOUR MYCAMPUS SPACE</span><h1>A little space <em>for you.</em></h1><p>Keep your campus details close and see what you have been part of.</p></div><button className="button button-primary" onClick={() => { setForm({ name: user?.name || '', department: user?.department || '', studentId: user?.studentId || '' }); setError(''); setEditOpen(true); }}><Icon name="file" size={16} /> Edit profile</button></section>
      <div className="profile-layout">
        <section className="profile-card">
          <div className="profile-cover"><span className="profile-cover-shape" /><span className="profile-cover-mark">✳</span></div>
          <div className="profile-avatar-large" style={{ '--avatar-color': user?.avatarColor || '#6d65e8' }}>{user?.name?.slice(0, 1) || 'A'}</div>
          <div className="profile-card-body"><span className="profile-role-pill"><Icon name={user?.role === 'admin' ? 'shield' : 'sparkle'} size={14} />{user?.role === 'admin' ? 'Campus administrator' : 'Campus member'}</span><h2>{user?.name}</h2><p>{user?.department || 'Your campus community'}</p>
            <div className="profile-info-list"><div><span>Email</span><strong>{user?.email}</strong></div><div><span>Student ID</span><strong>{user?.studentId || 'Not added'}</strong></div><div><span>Department</span><strong>{user?.department || 'Not added'}</strong></div></div>
            <div className="profile-account-actions"><Link to="/forgot-password">Change password</Link><button className="text-danger" onClick={() => { setPassword(''); setError(''); setDeleteOpen(true); }}>Delete my account</button></div>
          </div>
        </section>
        <section className="profile-activity">
          <div className="profile-activity-heading"><span className="section-eyebrow">YOUR CAMPUS ACTIVITY</span><h2>A few things you are part of.</h2></div>
          <div className="activity-stat-row"><div><strong>{joined.length}</strong><span>Events joined</span></div><div><strong>{shared.length}</strong><span>Posts shared</span></div></div>
          <h3 className="activity-subtitle">Events you joined</h3>
          {joined.length ? joined.map((event) => <div className="activity-row" key={event._id}><span className="activity-calendar"><Icon name="calendar" size={17} /></span><span><strong>{event.title}</strong><small>{new Date(event.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })} · {event.location}</small></span><Icon name="arrow" size={15} /></div>) : <div className="activity-empty">You have not joined an event yet. <Link to="/app/events">Find one to join →</Link></div>}
        </section>
      </div>
      {editOpen && <Modal title="Edit your profile" subtitle="Keep the details your campus sees up to date." onClose={() => setEditOpen(false)}><form className="form-stack" onSubmit={save}><label className="field-label">Name<input required maxLength="80" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label><label className="field-label">Department<input value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} /></label><label className="field-label">Student ID<input value={form.studentId} onChange={(event) => setForm((current) => ({ ...current, studentId: event.target.value }))} /></label><p className="field-hint">Your email stays verified and cannot be changed here.</p>{error && <p className="form-error">{error}</p>}<div className="form-actions"><button type="button" className="button button-quiet" onClick={() => setEditOpen(false)}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button></div></form></Modal>}
      {deleteOpen && <Modal title="Delete your account?" subtitle="Your profile, posts, and events you organized will be deleted. Your event registrations will be removed." onClose={() => setDeleteOpen(false)}><form className="form-stack" onSubmit={removeAccount}><label className="field-label">Current password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="form-error">{error}</p>}<div className="form-actions"><button type="button" className="button button-quiet" onClick={() => setDeleteOpen(false)}>Keep account</button><button className="button button-danger" disabled={saving}>{saving ? 'Deleting…' : 'Delete account'}</button></div></form></Modal>}
    </div>
  );
}
