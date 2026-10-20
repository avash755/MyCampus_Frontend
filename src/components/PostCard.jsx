import Icon from './Icon';

const labels = { resource: 'Study resource', 'lost-found': 'Lost & found', opportunity: 'Opportunity', notice: 'Campus notice' };

function getInitials(value = 'Campus') {
  return value.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export default function PostCard({ post }) {
  const author = post.author?.name || 'Campus member';
  const tags = Array.isArray(post.tags) ? post.tags : [];
  return (
    <article className={'post-card post-card-' + post.category}>
      <div className="post-card-top">
        <span className={'category-pill category-' + post.category}><span className="category-pill-dot" />{labels[post.category] || 'Campus post'}</span>
        {post.featured && <span className="featured-label"><Icon name="sparkle" size={13} /> Featured</span>}
      </div>
      <h3>{post.title}</h3>
      <p className="post-body">{post.body}</p>
      {tags.length > 0 && <div className="post-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
      {post.category === 'lost-found' && <div className="post-detail-line"><Icon name="pin" size={15} />{post.location || 'Location not listed'}</div>}
      {post.category === 'opportunity' && post.deadline && <div className="post-detail-line"><Icon name="clock" size={15} />Apply by {formatDate(post.deadline)}</div>}
      <div className="post-card-footer">
        <div className="post-author"><span className="author-avatar">{getInitials(author)}</span><span><strong>{author}</strong><small>{post.department || post.author?.department || 'MyCampus community'}</small></span></div>
        {post.link ? <a className="text-action" href={post.link} target="_blank" rel="noreferrer">{post.category === 'opportunity' ? 'View listing' : post.category === 'resource' ? 'Open resource' : 'More info'}<Icon name="external" size={14} /></a>
          : post.contact ? <a className="text-action" href={'mailto:' + post.contact}>Contact <Icon name="arrow" size={14} /></a>
            : <span className="post-date">{formatDate(post.createdAt)}</span>}
      </div>
    </article>
  );
}