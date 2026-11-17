import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { campusService } from '../services/campusService';

const WorkspaceContext = createContext(null);
const getId = (value) => String(value?._id || value?.id || value || '');

function refreshPage(current, incoming) {
  const incomingIds = new Set(incoming.map((item) => getId(item)));
  return [...incoming, ...current.filter((item) => !incomingIds.has(getId(item)))];
}

function appendPage(current, incoming) {
  const nextById = new Map(current.map((item) => [getId(item), item]));
  incoming.forEach((item) => nextById.set(getId(item), item));
  return [...current.map((item) => nextById.get(getId(item))), ...incoming.filter((item) => !current.some((old) => getId(old) === getId(item)))];
}

export function WorkspaceProvider({ children }) {
  const { user, authReady } = useAuth();
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMoreEvents, setLoadingMoreEvents] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [loadingMoreMyPosts, setLoadingMoreMyPosts] = useState(false);
  const [eventPagination, setEventPagination] = useState({ page: 1, hasMore: false });
  const [postPagination, setPostPagination] = useState({ page: 1, hasMore: false });
  const [myPostsPagination, setMyPostsPagination] = useState({ page: 1, hasMore: false });

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await campusService.loadWorkspace();
      setEvents((current) => refreshPage(current, data.events));
      setPosts((current) => refreshPage(current, data.posts));
      setMyPosts((current) => refreshPage(current, data.myPosts));
      setEventPagination((current) => current.page > 1 ? current : data.eventPagination);
      setPostPagination((current) => current.page > 1 ? current : data.postPagination);
      setMyPostsPagination((current) => current.page > 1 ? current : data.myPostsPagination);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshEvents = useCallback(async () => {
    if (!user) return;
    const data = await campusService.loadEvents(1);
    setEvents((current) => refreshPage(current, data.events || []));
    setEventPagination((current) => current.page > 1 ? current : data.pagination || current);
  }, [user]);

  const refreshPosts = useCallback(async () => {
    if (!user) return;
    const data = await campusService.loadPosts(1);
    setPosts((current) => refreshPage(current, data.posts || []));
    setPostPagination((current) => current.page > 1 ? current : data.pagination || current);
  }, [user]);

  const refreshMyPosts = useCallback(async () => {
    if (!user) return;
    const data = await campusService.loadMyPosts(1);
    setMyPosts((current) => refreshPage(current, data.posts || []));
    setMyPostsPagination((current) => current.page > 1 ? current : data.pagination || current);
  }, [user]);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    const data = await campusService.loadNotifications();
    setNotifications(data.notifications || []);
    setUnreadNotifications(data.unreadCount || 0);
  }, [user]);

  const loadMoreEvents = useCallback(async () => {
    if (!user || !eventPagination.hasMore || loadingMoreEvents) return;
    setLoadingMoreEvents(true);
    try {
      const data = await campusService.loadEvents(eventPagination.page + 1);
      setEvents((current) => appendPage(current, data.events || []));
      setEventPagination(data.pagination || eventPagination);
    } finally { setLoadingMoreEvents(false); }
  }, [user, eventPagination, loadingMoreEvents]);

  const loadMorePosts = useCallback(async () => {
    if (!user || !postPagination.hasMore || loadingMorePosts) return;
    setLoadingMorePosts(true);
    try {
      const data = await campusService.loadPosts(postPagination.page + 1);
      setPosts((current) => appendPage(current, data.posts || []));
      setPostPagination(data.pagination || postPagination);
    } finally { setLoadingMorePosts(false); }
  }, [user, postPagination, loadingMorePosts]);

  const loadMoreMyPosts = useCallback(async () => {
    if (!user || !myPostsPagination.hasMore || loadingMoreMyPosts) return;
    setLoadingMoreMyPosts(true);
    try {
      const data = await campusService.loadMyPosts(myPostsPagination.page + 1);
      setMyPosts((current) => appendPage(current, data.posts || []));
      setMyPostsPagination(data.pagination || myPostsPagination);
    } finally { setLoadingMoreMyPosts(false); }
  }, [user, myPostsPagination, loadingMoreMyPosts]);

  useEffect(() => {
    if (authReady && user) {
      refresh().catch((err) => console.error('Could not load MyCampus data:', err));
      refreshNotifications().catch((err) => console.error('Could not load notifications:', err));
    } else if (authReady && !user) {
      setEvents([]); setPosts([]); setMyPosts([]); setNotifications([]); setUnreadNotifications(0);
      setEventPagination({ page: 1, hasMore: false }); setPostPagination({ page: 1, hasMore: false });
      setMyPostsPagination({ page: 1, hasMore: false });
    }
  }, [refresh, refreshNotifications, authReady, user]);

  const syncVisibleWorkspace = useCallback(() => {
    if (document.visibilityState !== 'visible') return;
    refreshEvents().catch((err) => console.error('Could not refresh events:', err));
    refreshPosts().catch((err) => console.error('Could not refresh campus posts:', err));
    refreshNotifications().catch((err) => console.error('Could not refresh notifications:', err));
    if (user?.role !== 'admin') refreshMyPosts().catch((err) => console.error('Could not refresh your submissions:', err));
  }, [refreshEvents, refreshPosts, refreshNotifications, refreshMyPosts, user]);

  useEffect(() => {
    if (!authReady || !user) return undefined;
    const timer = window.setInterval(syncVisibleWorkspace, 30000 + Math.random() * 5000);
    window.addEventListener('focus', syncVisibleWorkspace);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', syncVisibleWorkspace); };
  }, [authReady, user, syncVisibleWorkspace]);

  const markNotificationRead = useCallback(async (id) => {
    await campusService.markNotificationRead(id);
    await refreshNotifications();
  }, [refreshNotifications]);

  const markAllNotificationsRead = useCallback(async () => {
    await campusService.markAllNotificationsRead();
    await refreshNotifications();
  }, [refreshNotifications]);

  async function addEvent(values) {
    const event = await campusService.createEvent(values, user);
    setEvents((current) => [event, ...current.filter((item) => item._id !== event._id)]);
    return event;
  }

  async function removeEvent(event) {
    await campusService.deleteEvent(event._id);
    setEvents((current) => current.filter((item) => item._id !== event._id));
  }

  async function registerEvent(event) {
    const result = await campusService.registerForEvent(event, user);
    setEvents((current) => current.map((item) => item._id === event._id
      ? { ...item, isRegistered: result.registered, attendeeCount: result.attendeeCount }
      : item));
    return result;
  }

  async function addPost(values) {
    const post = await campusService.createPost(values, user);
    setMyPosts((current) => [post, ...current.filter((item) => item._id !== post._id)]);
    if (post.status === 'approved' || !post.status) setPosts((current) => [post, ...current.filter((item) => item._id !== post._id)]);
    return post;
  }

  const value = useMemo(() => ({
    events, posts, myPosts, notifications, unreadNotifications, loading,
    eventHasMore: eventPagination.hasMore, postHasMore: postPagination.hasMore,
    myPostsHasMore: myPostsPagination.hasMore, loadingMoreEvents, loadingMorePosts, loadingMoreMyPosts,
    refresh, refreshEvents, refreshPosts, refreshMyPosts, refreshNotifications, loadMoreEvents, loadMorePosts, loadMoreMyPosts,
    markNotificationRead, markAllNotificationsRead, addEvent, removeEvent, registerEvent, addPost
  }), [events, posts, myPosts, notifications, unreadNotifications, loading, eventPagination, postPagination,
    myPostsPagination, loadingMoreEvents, loadingMorePosts, loadingMoreMyPosts, refresh, refreshEvents, refreshPosts, refreshMyPosts,
    refreshNotifications, loadMoreEvents, loadMorePosts, loadMoreMyPosts, markNotificationRead, markAllNotificationsRead, user]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('useWorkspace must be used inside WorkspaceProvider.');
  return value;
}
