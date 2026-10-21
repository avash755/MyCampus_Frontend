import { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import Modal from './Modal';
import Icon from './Icon';

const categoryCopy = {
  resource: ['Share a study resource', 'Help someone else find a useful class resource.'],
  'lost-found': ['Post to lost & found', 'A clear description helps an item find its way home.'],
  opportunity: ['Share an opportunity', 'Add the source link so students can confirm details and apply directly.'],
  notice: ['Post a campus notice', 'Share a useful update with your campus community.']
};

export default function PostForm({ category, onClose }) {
  const { addPost } = useWorkspace();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [form, setForm] = useState({ title: '', body: '', category, department: '', tags: '', link: '', location: '', contact: '', deadline: '' });
  const copy = categoryCopy[category] || categoryCopy.resource;

  function update(key, value) { setForm((current) => ({ ...current, [key]: value })); }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      deadline: form.deadline || undefined,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    };
    try {
      const post = await addPost(payload);
      if (post.status === 'pending') setSubmitted('Your post is in the moderation queue. It will appear on the board after an administrator approves it.');
      else setSubmitted('Your post has been published.');
    } catch (err) {
      setError(err.message || 'Could not create this post.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={submitted ? 'Thanks for sharing' : copy[0]} subtitle={submitted ? '' : copy[1]} onClose={onClose}>
      {submitted ? <div className="post-submitted"><span className="empty-icon"><Icon name="check" /></span><p>{submitted}</p><button className="button button-primary" onClick={onClose}>Done</button></div> : <form className="form-stack" onSubmit={submit}>
        <label className="field-label">Title<input required maxLength="140" value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Give your post a clear title" /></label>
        <label className="field-label">Description<textarea required rows="4" maxLength="3000" value={form.body} onChange={(event) => update('body', event.target.value)} placeholder="Add the details people need to know" /></label>
        {category !== 'lost-found' && <label className="field-label">Department or audience<input value={form.department} onChange={(event) => update('department', event.target.value)} placeholder="e.g. All departments" /></label>}
        {category === 'resource' && <>
          <label className="field-label">Resource link<input type="url" value={form.link} onChange={(event) => update('link', event.target.value)} placeholder="https://" /></label>
          <label className="field-label">Topics <span className="field-hint">(separate with commas)</span><input value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="Lecture notes, Year 2" /></label>
        </>}
        {category === 'opportunity' && <>
          <label className="field-label">Original listing or application link<input required type="url" value={form.link} onChange={(event) => update('link', event.target.value)} placeholder="https://" /></label>
          <div className="field-note"><Icon name="shield" size={16} /> MyCampus shares listings; students confirm details and apply directly with the organization.</div>
          <label className="field-label">Application deadline <span className="field-hint">(optional)</span><input type="date" value={form.deadline} onChange={(event) => update('deadline', event.target.value)} /></label>
          <label className="field-label">Topics <span className="field-hint">(separate with commas)</span><input value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="Internship, Design" /></label>
        </>}
        {category === 'lost-found' && <div className="form-grid">
          <label className="field-label">Where was it found?<input value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Library, building, room…" /></label>
          <label className="field-label">How can they reach you?<input value={form.contact} onChange={(event) => update('contact', event.target.value)} placeholder="Email or campus contact" /></label>
        </div>}
        {category === 'notice' && <label className="field-label">Link <span className="field-hint">(optional)</span><input type="url" value={form.link} onChange={(event) => update('link', event.target.value)} placeholder="https://" /></label>}
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? 'Posting…' : <><Icon name="send" size={15} /> Submit post</>}</button></div>
      </form>}
    </Modal>
  );
}
