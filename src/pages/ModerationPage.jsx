import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campusService } from '../services/campusService';
import { useWorkspace } from '../context/WorkspaceContext';
import Icon from '../components/Icon';
import { safeExternalUrl } from '../utils/safeUrl';
import { campusAvatarColor } from '../utils/avatarColor';

const filters = ['pending', 'approved', 'rejected', 'closed'];

export default function ModerationPage() {
  const { refresh, refreshNotifications } = useWorkspace();
  const [status, setStatus] = useState('pending');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadQueue(nextStatus = status, silent = false, nextPage = 1, append = false) {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await campusService.loadModeration(nextStatus, nextPage);
      const incoming = data.posts || [];
      setPosts((current) => {
        if (append) {
          const ids = new Set(current.map((item) => item._id));
          return [...current, ...incoming.filter((item) => !ids.has(item._id))];
        }
        if (silent && nextPage === 1 && page > 1) {
          const ids = new Set(incoming.map((item) => item._id));
          return [...incoming, ...current.filter((item) => !ids.has(item._id))];
        }
        return incoming;
      });
      setPage((current) => append ? nextPage : (silent && nextPage === 1 && current > 1 ? current : nextPage));
      setHasMore(Boolean(data.pagination?.hasMore));
    } catch (err) {
      setError(err.message || 'Could not load the moderation queue.');
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(false);
    loadQueue(status);
    const refreshQueue = () => {
      if (document.visibilityState === 'visible') loadQueue(status, true, 1);
    };
    const timer = window.setInterval(refreshQueue, 25000 + Math.random() * 5000);
    window.addEventListener('focus', refreshQueue);
    document.addEventListener('visibilitychange', refreshQueue);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshQueue);
      document.removeEventListener('visibilitychange', refreshQueue);
    };
  }, [status]);

  async function loadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try { await loadQueue(status, true, page + 1, true); }
    finally { setLoadingMore(false); }
  }

  async function act(post, action, featured) {
    setBusyId(post._id);
    setError('');
    try {
      await campusService.moderatePost(post._id, action, featured);
      if (action === 'feature') {
        await loadQueue(status, true, page);
      } else {
        setPosts((current) => current.filter((item) => item._id !== post._id));
        await loadQueue(status, true, page);
      }
      await Promise.all([refresh(), refreshNotifications()]);
    } catch (err) { setError(err.message || 'Could not update this post.'); }
    finally { setBusyId(''); }
  }

  async function remove(post) {
    if (!window.confirm(`Permanently delete “${post.title}”?`)) return;
    setBusyId(post._id);
    setError('');
    try {
      await campusService.deletePost(post._id);
      setPosts((current) => current.filter((item) => item._id !== post._id));
      await loadQueue(status, true, page);
      await Promise.all([refresh(), refreshNotifications()]);
    } catch (err) { setError(err.message || 'Could not delete this post.'); }
    finally { setBusyId(''); }
  }

  return (
    <div className="listing-page moderation-page">
      <section className="page-intro">
        <div><span className="section-eyebrow">CAMPUS ADMINISTRATION</span><h1>Keep the board <em>helpful.</em></h1><p>Review student submissions, keep posts up to date, and highlight useful campus information.</p></div>
        <span className="moderation-shield"><Icon name="shield" size={23} /></span>
      </section>
      <div className="moderation-toolbar">
        <div className="moderation-tabs" role="tablist" aria-label="Post status">
          {filters.map((filter) => <button key={filter} className={status === filter ? 'moderation-tab is-active' : 'moderation-tab'} onClick={() => setStatus(filter)}>{filter[0].toUpperCase() + filter.slice(1)}</button>)}
        </div>
        <button className="button button-quiet" onClick={() => loadQueue(status)}><Icon name="arrow" size={15} /> Refresh <span className="queue-live-label">Refreshes every 25 seconds while open</span></button>
      </div>
      {error && <p className="form-error">{error}</p>}
      {loading ? <div className="empty-panel"><p>Loading posts…</p></div> : posts.length ? (
        <>
          <div className="moderation-list">
            {posts.map((post) => {
              const authorId = post.author?._id;
              const authorName = post.author?.name || 'Campus member';
              const externalUrl = safeExternalUrl(post.link);
              const avatar = <span className="moderation-author-avatar" style={{ '--avatar-color': campusAvatarColor(post.author?.avatarColor) }}>
                {post.author?.profileImage ? <img src={post.author.profileImage} alt="" /> : authorName.slice(0, 1)}
              </span>;
              return <article className="moderation-card" key={post._id}>
                <div className="moderation-card-top"><span className="post-category-pill">{post.category.replace('-', ' ')}</span><span className={'moderation-status status-' + (post.status || 'approved')}>{post.status || 'approved'}</span></div>
                <h2>{post.title}</h2><p className="moderation-copy">{post.body}</p>
                <div className="moderation-byline">
                  {authorId ? <Link className="moderation-author-avatar-link" to={'/app/members/' + authorId} aria-label={'View ' + authorName + ' profile'}>{avatar}</Link> : avatar}
                  <span>Submitted by {authorId ? <Link className="moderation-author-link" to={'/app/members/' + authorId}>{authorName}</Link> : authorName}{post.author?.department ? ` · ${post.author.department}` : ''} · {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                {externalUrl && <a className="moderation-source" href={externalUrl} target="_blank" rel="noopener noreferrer"><Icon name="arrow" size={14} /> Review submitted link</a>}
                <div className="moderation-actions">
                  {post.status !== 'approved' && <button className="button button-primary button-small" disabled={busyId === post._id} onClick={() => act(post, 'approve')}><Icon name="check" size={14} /> Approve</button>}
                  {post.status !== 'rejected' && <button className="button button-quiet button-small" disabled={busyId === post._id} onClick={() => act(post, 'reject')}>Reject</button>}
                  {post.status !== 'closed' && <button className="button button-quiet button-small" disabled={busyId === post._id} onClick={() => act(post, 'close')}>Close</button>}
                  <button className="button button-quiet button-small" disabled={busyId === post._id} onClick={() => act(post, 'feature', !post.featured)}><Icon name="sparkle" size={14} /> {post.featured ? 'Unfeature' : 'Feature'}</button>
                  <button className="button button-danger button-small" disabled={busyId === post._id} onClick={() => remove(post)}>Delete</button>
                </div>
              </article>;
            })}
          </div>
          {hasMore && <div className="load-more-row"><button className="button button-quiet" disabled={loadingMore} onClick={loadMore}>{loadingMore ? 'Loading…' : 'Load more posts'}</button></div>}
        </>
      ) : <div className="empty-panel"><span className="empty-icon"><Icon name="check" /></span><h3>No {status} posts</h3><p>This part of the moderation queue is clear.</p></div>}
    </div>
  );
}
