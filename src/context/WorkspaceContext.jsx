import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { campusService } from '../services/campusService';

const WorkspaceContext = createContext(null);
const getId = (value) => String(value?.id || value?._id || value || '');

export function WorkspaceProvider({ children }) {
  const { user, authReady } = useAuth();
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await campusService.loadWorkspace();
      setEvents(data.events || []);
      setPosts(data.posts || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authReady && user) refresh().catch((err) => console.error('Could not load MyCampus data:', err));
  }, [refresh, authReady, user]);

  async function addEvent(values) {
    const event = await campusService.createEvent(values, user);
    setEvents((current) => [event, ...current]);
    return event;
  }

  async function removeEvent(event) {
    await campusService.deleteEvent(event._id);
    setEvents((current) => current.filter((item) => item._id !== event._id));
  }

  async function registerEvent(event) {
    let result;
    try {
      result = await campusService.registerForEvent(event, user);
    } catch (err) {
      if (err.data?.attendeeCount !== undefined) {
        setEvents((current) => current.map((item) => item._id === event._id
          ? { ...item, attendeeCount: err.data.attendeeCount }
          : item));
      }
      throw err;
    }
    setEvents((current) => current.map((item) => {
      if (item._id !== event._id) return item;
      if (result.event) return result.event;
      const currentIds = (item.attendees || []).map(getId);
      const userId = getId(user);
      const nextIds = result.registered
        ? [...currentIds.filter((id) => id !== userId), userId]
        : currentIds.filter((id) => id !== userId);
      return { ...item, attendees: nextIds, attendeeCount: result.attendeeCount ?? nextIds.length };
    }));
    return result;
  }

  async function addPost(values) {
    const post = await campusService.createPost(values, user);
    if (post.status === 'approved' || !post.status) setPosts((current) => [post, ...current]);
    return post;
  }

  const value = useMemo(() => ({ events, posts, loading, refresh, addEvent, removeEvent, registerEvent, addPost }), [events, posts, loading, user]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('useWorkspace must be used inside WorkspaceProvider.');
  return value;
}
