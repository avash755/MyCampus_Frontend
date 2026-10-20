import { useMemo, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
import Icon from '../components/Icon';

const config = {
  resource: {
    eyebrow: 'A LITTLE HELP GOES A LONG WAY',
    title: <>Better notes. <em>Better together.</em></>,
    description: 'Find the guides, links, and class notes your campus community found useful.',
    action: 'Share a resource', empty: 'No resources yet. Share something useful with your campus.'
  },
  'lost-found': {
    eyebrow: 'HELP SOMETHING FIND ITS WAY HOME',
    title: <>Lost something? <em>Found something?</em></>,
    description: 'A friendly place to reconnect campus items with the people who miss them.',
    action: 'Post an item', empty: 'Nothing posted here right now. You can be the first to help.'
  },
  opportunity: {
    eyebrow: 'A NEXT STEP TO EXPLORE',
    title: <>See what is <em>out there.</em></>,
    description: 'Browse internships, workshops, and other opportunities shared by your campus.',
    action: 'Share an opportunity', empty: 'No opportunities listed yet. Check back soon or share a public listing.'
  },
  notice: {
    eyebrow: 'A NOTE FROM YOUR CAMPUS',
    title: <>The little things <em>to know.</em></>,
    description: 'Helpful announcements and updates from across your campus community.',
    action: 'Post a notice', empty: 'No notices for now. Check back when there is a new campus update.'
  }
};

export default function PostsPage({ category }) {
  const { posts } = useWorkspace();
  const { user } = useAuth();
  const canPost = category !== 'notice' || user?.role === 'admin';
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState('');
  const page = config[category];
  const visible = useMemo(() => posts
    .filter((post) => post.category === category)
    .filter((post) => (post.title + ' ' + post.body + ' ' + (post.tags || []).join(' ')).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))), [posts, category, query]);

  return (
    <div className="listing-page">
      <section className={'page-intro post-intro intro-' + category}><div><span className="section-eyebrow">{page.eyebrow}</span><h1>{page.title}</h1><p>{page.description}</p></div>{canPost && <button className="button button-primary" onClick={() => setCreateOpen(true)}><Icon name="plus" size={17} /> {page.action}</button>}</section>
      {category === 'opportunity' && <div className="opportunity-note"><Icon name="shield" size={17} /><span><strong>A note on opportunity listings</strong> MyCampus shares listings and links. Students should verify details and apply directly with each organization.</span></div>}
      <div className="list-toolbar post-list-toolbar"><div className="list-count"><strong>{visible.length.toString().padStart(2, '0')}</strong> {category === 'resource' ? 'resources shared' : category === 'lost-found' ? 'items in the board' : category === 'opportunity' ? 'listings to explore' : 'campus updates'}</div><label className="inline-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this board" /></label></div>
      {visible.length ? <div className="posts-grid">{visible.map((post) => <PostCard key={post._id} post={post} />)}</div> : <div className="empty-panel"><span className="empty-icon"><Icon name={category === 'opportunity' ? 'briefcase' : category === 'lost-found' ? 'pin' : category === 'notice' ? 'bell' : 'book'} /></span><h3>Nothing here yet</h3><p>{page.empty}</p>{canPost && <button className="button button-primary" onClick={() => setCreateOpen(true)}><Icon name="plus" size={16} /> {page.action}</button>}</div>}
      {createOpen && <PostForm category={category} onClose={() => setCreateOpen(false)} />}
    </div>
  );
}