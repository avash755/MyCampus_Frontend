import { useEffect, useState } from 'react';
import { campusService } from '../services/campusService';
import { useWorkspace } from '../context/WorkspaceContext';
import Icon from '../components/Icon';

const filters = ['pending', 'approved', 'rejected', 'closed'];

export default function ModerationPage() {
  const { refresh } = useWorkspace();
  const [status, setStatus] = useState('pending');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  async function loadQueue(nextStatus = status) {
    setLoading(true); setError('');
    try { setPosts(await campusService.loadModeration(nextStatus)); }
    catch (err) { setError(err.message || 'Could not load the moderation queue.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadQueue(status); }, [status]);

  async function act(post, action, featured) {
    setBusyId(post._id); setError('');
    try {
      const updated = await campusService.moderatePost(post._id, action, featured);
      if (action === 'feature') setPosts((current) => current.map((item) => item._id === post._id ? updated : item));
      else setPosts((current) => current.filter((item) => item._id !== post._id));
      await refresh();
    } catch (err) { setError(err.message || 'Could not update this post.'); }
    finally { setBusyId(''); }
  }

  async function remove(post) {
    if (!window.confirm(`Permanently delete “${post.title}”?`)) return;
    setBusyId(post._id); setError('');
    try {
      await campusService.deletePost(post._id);
      setPosts((current) => current.filter((item) => item._id !== post._id));
      await refresh();
    } catch (err) { setError(err.message || 'Could not delete this post.'); }
    finally { setBusyId(''); }
  }

  return <div className="listing-page moderation-page"><section className="page-intro"><div><span className="section-eyebrow">CAMPUS ADMINISTRATION</span><h1>Keep the board <em>helpful.</em></h1><p>Review student submissions, keep posts up to date, and highlight useful campus information.</p></div><span className="moderation-shield"><Icon name="shield" size={23} /></span></section><div className="moderation-toolbar"><div className="moderation-tabs" role="tablist" aria-label="Post status">{filters.map((filter) => <button key={filter} className={status === filter ? 'moderation-tab is-active' : 'moderation-tab'} onClick={() => setStatus(filter)}>{filter[0].toUpperCase() + filter.slice(1)}</button>)}</div><button className="button button-quiet" onClick={() => loadQueue()}><Icon name="arrow" size={15} /> Refresh</button></div>{error && <p className="form-error">{error}</p>}{loading ? <div className="empty-panel"><p>Loading posts…</p></div> : posts.length ? <div className="moderation-list">{posts.map((post) => <article className="moderation-card" key={post._id}><div className="moderation-card-top"><span className="post-category-pill">{post.category.replace('-', ' ')}</span><span className={'moderation-status status-' + (post.status || 'approved')}>{post.status || 'approved'}</span></div><h2>{post.title}</h2><p className="moderation-copy">{post.body}</p><div className="moderation-byline">Submitted by <strong>{post.author?.name || 'Campus member'}</strong>{post.author?.department ? ` · ${post.author.department}` : ''} · {new Date(post.createdAt).toLocaleDateString()}</div>{post.link && <a className="moderation-source" href={post.link} target="_blank" rel="noreferrer"><Icon name="arrow" size={14} /> Review submitted link</a>}<div className="moderation-actions">{post.status !== 'approved' && <button className="button button-primary button-small" disabled={busyId === post._id} onClick={() => act(post, 'approve')}><Icon name="check" size={14} /> Approve</button>}{post.status !== 'rejected' && <button className="button button-quiet button-small" disabled={busyId === post._id} onClick={() => act(post, 'reject')}>Reject</button>}{post.status !== 'closed' && <button className="button button-quiet button-small" disabled={busyId === post._id} onClick={() => act(post, 'close')}>Close</button>}<button className="button button-quiet button-small" disabled={busyId === post._id} onClick={() => act(post, 'feature', !post.featured)}><Icon name="sparkle" size={14} /> {post.featured ? 'Unfeature' : 'Feature'}</button><button className="button button-danger button-small" disabled={busyId === post._id} onClick={() => remove(post)}>Delete</button></div></article>)}</div> : <div className="empty-panel"><span className="empty-icon"><Icon name="check" /></span><h3>No {status} posts</h3><p>This part of the moderation queue is clear.</p></div>}</div>;
}


