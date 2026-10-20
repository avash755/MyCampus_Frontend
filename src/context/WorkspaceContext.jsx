import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { campusService } from '../services/campusService';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
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
    refresh();
  }, [refresh]);

  async function addEvent(values) {
    const event = await campusService.createEvent(values, user);
    setEvents((current) => [event, ...current]);
    return event;
  }

  async function registerEvent(event) {
    const result = await campusService.registerForEvent(event, user);
    if (result.event) {
      setEvents((current) => current.map((item) => item._id === event._id ? result.event : item));
    } else {
      setEvents((current) => current.map((item) => {
        if (item._id !== event._id) return item;
        const currentIds = (item.attendees || []).map((person) => person?.id || person?._id || person);
        const nextIds = result.registered
          ? [...currentIds, user?.id]
          : currentIds.filter((id) => id !== user?.id);
        return { ...item, attendees: nextIds };
      }));
    }
    return result;
  }

  async function addPost(values) {
    const post = await campusService.createPost(values, user);
    setPosts((current) => [post, ...current]);
    return post;
  }

  const value = useMemo(() => ({
    events, posts, loading, refresh, addEvent, registerEvent, addPost
  }), [events, posts, loading, user]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('useWorkspace must be used inside WorkspaceProvider.');
  return value;
}