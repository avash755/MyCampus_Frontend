import { useEffect, useRef, useState } from 'react';
import { campusService } from '../services/campusService';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

export default function EventChat({ eventId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const bottom = useRef(null);
  const latestMessageAt = useRef('');

  useEffect(() => {
    let active = true;
    latestMessageAt.current = '';
    setMessages([]);
    setError('');

    const load = async () => {
      try {
        const next = await campusService.listEventMessages(eventId, latestMessageAt.current || undefined);
        if (!active) return;
        setMessages((current) => {
          const messagesById = new Map(current.map((message) => [message._id, message]));
          next.forEach((message) => messagesById.set(message._id, message));
          return [...messagesById.values()]
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .slice(-60);
        });
        const latest = next.at(-1);
        if (latest) latestMessageAt.current = { createdAt: latest.createdAt, id: latest._id };
        setError('');
      } catch (err) {
        if (active) setError(err.message || 'Could not load this event discussion.');
      }
    };

    load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 15000 + Math.random() * 5000);
    const onFocus = () => { if (document.visibilityState === 'visible') load(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [eventId]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  async function submit(event) {
    event.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    setError('');
    try {
      const message = await campusService.sendEventMessage(eventId, text);
      setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message].slice(-60));
      if (message.createdAt) latestMessageAt.current = { createdAt: message.createdAt, id: message._id };
      setBody('');
    } catch (err) {
      setError(err.message || 'Your message could not be sent.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="module-chat event-chat">
      <header className="module-chat-heading">
        <span className="module-chat-icon"><Icon name="users" size={19} /></span>
        <span><strong>Event discussion</strong><small>All signed-in campus members · checks for new messages while open</small></span>
        <i className="chat-live-dot" title="Checks for new messages automatically" />
      </header>
      <div className="module-chat-messages" aria-live="polite">
        {!messages.length && !error && <div className="module-chat-empty">No messages yet. Start the conversation about this event.</div>}
        {messages.map((message) => {
          const own = String(message.sender?._id || message.sender?.id) === String(user?.id || user?._id);
          return (
            <article className={'module-chat-message ' + (own ? 'is-own' : '')} key={message._id}>
              {!own && <small>{message.sender?.name || 'Campus member'}{message.sender?.role === 'admin' ? ' · Admin' : ''}</small>}
              <p>{message.body}</p>
              <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
            </article>
          );
        })}
        <div ref={bottom} />
      </div>
      {error && <p className="module-chat-error">{error}</p>}
      <form className="module-chat-compose" onSubmit={submit}>
        <textarea aria-label="Write an event message" rows="1" maxLength="2000" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Message everyone about this event…" />
        <button className="button button-primary" disabled={!body.trim() || sending} aria-label="Send message"><Icon name="arrow" size={17} /></button>
      </form>
    </section>
  );
}
