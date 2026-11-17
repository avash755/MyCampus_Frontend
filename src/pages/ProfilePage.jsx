import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { campusAvatarColor } from '../utils/avatarColor';

const getId = (value) => String(value?.id || value?._id || value || '');

async function compressImage(file, maxWidth, maxHeight, maxLength) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Choose an image smaller than 15 MB.');

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not process this image.');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let quality = 0.84;
  let imageData = canvas.toDataURL('image/jpeg', quality);
  while (imageData.length > maxLength && quality > 0.48) {
    quality -= 0.08;
    imageData = canvas.toDataURL('image/jpeg', quality);
  }
  if (imageData.length > maxLength) throw new Error('This image is too detailed. Choose a smaller image.');
  return imageData;
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { events, posts } = useWorkspace();
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processingImage, setProcessingImage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '', studentId: user?.studentId || '', profileImage: user?.profileImage || '', coverImage: user?.coverImage || '' });
  const avatarColor = user?.role === 'admin' ? '#08754f' : campusAvatarColor(user?.avatarColor);

  const joined = events.filter((event) => event.isRegistered);
  const shared = posts.filter((post) => getId(post.author) === getId(user));

  function openEditor() {
    setForm({
      name: user?.name || '',
      department: user?.department || '',
      studentId: user?.studentId || '',
      profileImage: user?.profileImage || '',
      coverImage: user?.coverImage || ''
    });
    setError('');
    setEditOpen(true);
  }

  async function selectImage(event, field) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setProcessingImage(field);
    setError('');
    try {
      const image = field === 'profileImage'
        ? await compressImage(file, 512, 512, 780000)
        : await compressImage(file, 1600, 600, 1750000);
      setForm((current) => ({ ...current, [field]: image }));
    } catch (err) {
      setError(err.message || 'Could not process this image.');
    } finally {
      setProcessingImage('');
    }
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateProfile(form);
      setEditOpen(false);
    } catch (err) {
      setError(err.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <section className="page-intro">
        <div>
          <span className="section-eyebrow">YOUR MYCAMPUS SPACE</span>
          <h1>A little space <em>for you.</em></h1>
          <p>Keep your campus details close and see what you have been part of.</p>
        </div>
        <button className="button button-primary" onClick={openEditor}>
          <Icon name="file" size={16} /> Edit profile
        </button>
      </section>

      <div className="profile-layout">
        <section className="profile-card">
          <div
            className={'profile-cover' + (user?.coverImage ? ' profile-cover-image' : '')}
            style={user?.coverImage ? { backgroundImage: 'url(' + user.coverImage + ')' } : undefined}
          >
            <span className="profile-cover-shape" />
            <span className="profile-cover-mark">✳</span>
          </div>
          <div className="profile-avatar-large" style={{ '--avatar-color': avatarColor }}>
            {user?.profileImage
              ? <img src={user.profileImage} alt="" />
              : (user?.name?.slice(0, 1) || 'A')}
          </div>
          <div className="profile-card-body">
            <span className="profile-role-pill"><Icon name={user?.role === 'admin' ? 'shield' : 'sparkle'} size={14} />{user?.role === 'admin' ? 'Campus administrator' : 'Campus member'}</span>
            <h2>{user?.name}</h2>
            <p>{user?.department || 'Your campus community'}</p>
            <div className="profile-info-list">
              <div><span>Email</span><strong>{user?.email}</strong></div>
              <div><span>Student ID</span><strong>{user?.studentId || 'Not added'}</strong></div>
              <div><span>Department</span><strong>{user?.department || 'Not added'}</strong></div>
            </div>
            <div className="profile-account-actions"><Link to="/forgot-password">Change password</Link></div>
          </div>
        </section>

        <section className="profile-activity">
          <div className="profile-activity-heading"><span className="section-eyebrow">YOUR CAMPUS ACTIVITY</span><h2>A few things you are part of.</h2></div>
          <div className="activity-stat-row">
            <div><strong>{joined.length}</strong><span>Events joined</span></div>
            <div><strong>{shared.length}</strong><span>Posts shared</span></div>
          </div>
          <h3 className="activity-subtitle">Events you joined</h3>
          {joined.length ? joined.map((event) => (
            <div className="activity-row" key={event._id}>
              <span className="activity-calendar"><Icon name="calendar" size={17} /></span>
              <span><strong>{event.title}</strong><small>{new Date(event.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })} · {event.location}</small></span>
              <Icon name="arrow" size={15} />
            </div>
          )) : <div className="activity-empty">You have not joined an event yet. <Link to="/app/events">Find one to join →</Link></div>}
        </section>
      </div>

      {editOpen && (
        <Modal title="Edit your profile" subtitle="Update your campus details and photos." onClose={() => setEditOpen(false)}>
          <form className="form-stack" onSubmit={save}>
            <label className="field-label">Name<input required maxLength="80" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
            <label className="field-label">Department<input value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} /></label>
            <label className="field-label">Student ID<input value={form.studentId} onChange={(event) => setForm((current) => ({ ...current, studentId: event.target.value }))} /></label>

            <div className="profile-image-editor">
              <div className="profile-image-editor-row">
                <span className="profile-avatar-preview" style={{ '--avatar-color': avatarColor }}>
                  {form.profileImage ? <img src={form.profileImage} alt="" /> : (form.name?.slice(0, 1) || 'A')}
                </span>
                <div className="profile-image-editor-copy">
                  <strong>Profile photo</strong>
                  <span>Shown in your profile and sidebar.</span>
                  <label className="button button-quiet button-small profile-file-button">
                    {processingImage === 'profileImage' ? 'Preparing…' : 'Choose photo'}
                    <input type="file" accept="image/*" disabled={processingImage !== '' || saving} onChange={(event) => selectImage(event, 'profileImage')} />
                  </label>
                  {form.profileImage && <button type="button" className="profile-remove-image" onClick={() => setForm((current) => ({ ...current, profileImage: '' }))}>Remove photo</button>}
                </div>
              </div>

              <div className="profile-cover-editor">
                <div className="profile-cover-preview" style={form.coverImage ? { backgroundImage: 'url(' + form.coverImage + ')' } : undefined}>
                  {!form.coverImage && <span>Cover preview</span>}
                </div>
                <div className="profile-image-editor-copy">
                  <strong>Cover photo</strong>
                  <span>Displayed at the top of your profile.</span>
                  <label className="button button-quiet button-small profile-file-button">
                    {processingImage === 'coverImage' ? 'Preparing…' : 'Choose cover'}
                    <input type="file" accept="image/*" disabled={processingImage !== '' || saving} onChange={(event) => selectImage(event, 'coverImage')} />
                  </label>
                  {form.coverImage && <button type="button" className="profile-remove-image" onClick={() => setForm((current) => ({ ...current, coverImage: '' }))}>Remove cover</button>}
                </div>
              </div>
              <p className="field-hint">Images are resized and compressed before saving. Choose JPEG, PNG, or WebP files up to 15 MB.</p>
            </div>

            <p className="field-hint">Your email stays verified and cannot be changed here.</p>
            {error && <p className="form-error">{error}</p>}
            <div className="form-actions">
              <button type="button" className="button button-quiet" onClick={() => setEditOpen(false)}>Cancel</button>
              <button className="button button-primary" disabled={saving || processingImage !== ''}>{saving ? 'Saving…' : processingImage ? 'Preparing image…' : 'Save profile'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
