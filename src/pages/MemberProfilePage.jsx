import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { campusService } from '../services/campusService';
import PostCard from '../components/PostCard';
import Icon from '../components/Icon';
import { campusAvatarColor } from '../utils/avatarColor';

export default function MemberProfilePage() {
  const { memberId } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    campusService.loadMemberProfile(memberId, 1)
      .then((data) => {
        if (!active) return;
        setProfile(data.profile);
        setPosts(data.posts || []);
        setPage(1);
        setHasMore(Boolean(data.pagination?.hasMore));
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load this member profile.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [memberId]);

  async function loadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await campusService.loadMemberProfile(memberId, page + 1);
      setPosts((current) => {
        const ids = new Set(current.map((post) => post._id));
        return [...current, ...(data.posts || []).filter((post) => !ids.has(post._id))];
      });
      setPage(data.pagination?.page || page + 1);
      setHasMore(Boolean(data.pagination?.hasMore));
    } catch (err) { setError(err.message || 'Could not load more posts.'); }
    finally { setLoadingMore(false); }
  }

  if (loading) return <div className="empty-panel"><p>Loading member profile…</p></div>;
  if (error || !profile) return <div className="empty-panel"><span className="empty-icon"><Icon name="users" /></span><h3>Profile unavailable</h3><p>{error || 'This member profile could not be found.'}</p></div>;

  const initials = profile.name?.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'MC';
  const since = profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString([], { month: 'long', year: 'numeric' }) : '';
  const memberAvatarColor = profile.role === 'admin' ? '#08754f' : campusAvatarColor(profile.avatarColor);
  const author = { _id: profile.id, name: profile.name, department: profile.department, avatarColor: memberAvatarColor, profileImage: profile.profileImage };

  return <div className="member-profile-page">
    <section className="member-profile-card">
      <div className={'member-profile-cover' + (profile.coverImage ? ' has-cover-image' : '')} style={profile.coverImage ? { backgroundImage: `url(${profile.coverImage})` } : undefined} />
      <div className="member-profile-info">
        <span className="member-profile-avatar" style={{ '--avatar-color': memberAvatarColor }}>{profile.profileImage ? <img src={profile.profileImage} alt="" /> : initials}</span>
        <div className="member-profile-heading"><span className="section-eyebrow">CAMPUS MEMBER</span><h1>{profile.name}</h1><p>{profile.department || 'MyCampus community'}</p></div>
        {profile.role === 'admin' && <span className="profile-role-pill"><Icon name="shield" size={14} />Campus administrator</span>}
      </div>
      <div className="member-profile-meta"><span><Icon name="book" size={15} />{profile.department || 'Department not added'}</span>{since && <span>Member since {since}</span>}</div>
    </section>
    <section className="member-posts-section"><div className="member-posts-heading"><div><span className="section-eyebrow">CAMPUS CONTRIBUTIONS</span><h2>Posts shared</h2></div><span>{posts.length}</span></div>
      {posts.length ? <div className="posts-grid">{posts.map((post) => <PostCard key={post._id} post={{ ...post, author }} />)}</div> : <div className="empty-panel"><h3>No approved posts yet</h3><p>Posts shared by this member will appear here after administrator approval.</p></div>}
      {hasMore && <div className="load-more-row"><button className="button button-quiet" disabled={loadingMore} onClick={loadMore}>{loadingMore ? 'Loading…' : 'Load more posts'}</button></div>}
    </section>
  </div>;
}
