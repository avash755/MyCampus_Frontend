import { demoAdmin, demoStudent, initialEvents, initialPosts } from '../data/demoData';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const DATA_KEY = 'mycampus-workspace-v1';
const TOKEN_KEY = 'mycampus-token';

function readLocalData() {
  try {
    const saved = localStorage.getItem(DATA_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn('Could not read saved demo data.', err);
  }
  const firstRun = { events: initialEvents, posts: initialPosts };
  localStorage.setItem(DATA_KEY, JSON.stringify(firstRun));
  return firstRun;
}

function saveLocalData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
  return data;
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = options.token || localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = 'Bearer ' + token;

  const response = await fetch(API_URL + '/api' + path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'The request could not be completed.');
  return data;
}

function localUser(email, name) {
  const isAdmin = email?.toLowerCase() === demoAdmin.email;
  return {
    ...(isAdmin ? demoAdmin : demoStudent),
    name: name || (isAdmin ? demoAdmin.name : demoStudent.name),
    email: email || demoStudent.email
  };
}

export const campusService = {
  async signIn({ email, password }) {
    if (API_URL) return request('/auth/login', { method: 'POST', body: { email, password } });
    if (!email || !password) throw new Error('Enter your email and password.');
    return { user: localUser(email) };
  },

  async signUp(values) {
    if (API_URL) return request('/auth/register', { method: 'POST', body: values });
    return { user: localUser(values.email, values.name) };
  },

  async loadWorkspace() {
    const local = readLocalData();
    if (!API_URL) return local;
    try {
      const [eventData, postData] = await Promise.all([
        request('/events'),
        request('/posts')
      ]);
      return {
        events: eventData.events || [],
        posts: postData.posts || []
      };
    } catch (err) {
      console.info('Using the local demo workspace:', err.message);
      return local;
    }
  },

  async createEvent(values, user) {
    if (API_URL) {
      try {
        const result = await request('/events', { method: 'POST', body: values });
        return result.event;
      } catch (err) {
        console.info('Saving the event to the local demo workspace:', err.message);
      }
    }
    const event = {
      ...values,
      _id: 'event-' + Date.now(),
      organizer: { name: user?.name || 'MyCampus member' },
      attendees: [],
      createdAt: new Date().toISOString()
    };
    const data = readLocalData();
    saveLocalData({ ...data, events: [event, ...data.events] });
    return event;
  },

  async registerForEvent(event, user) {
    if (API_URL && !String(event._id).startsWith('event-')) {
      try {
        return await request('/events/' + event._id + '/register', { method: 'POST', body: {} });
      } catch (err) {
        console.info('Using local event registration:', err.message);
      }
    }
    const data = readLocalData();
    const registered = (event.attendees || []).includes(user?.id);
    const attendees = registered
      ? (event.attendees || []).filter((id) => id !== user?.id)
      : [...(event.attendees || []), user?.id];
    const updated = { ...event, attendees };
    saveLocalData({
      ...data,
      events: data.events.map((item) => item._id === event._id ? updated : item)
    });
    return { registered: !registered, event: updated };
  },

  async createPost(values, user) {
    if (API_URL) {
      try {
        const result = await request('/posts', { method: 'POST', body: values });
        return result.post;
      } catch (err) {
        console.info('Saving the post to the local demo workspace:', err.message);
      }
    }
    const post = {
      ...values,
      _id: 'post-' + Date.now(),
      author: { name: user?.name || 'MyCampus member', department: user?.department || '' },
      tags: typeof values.tags === 'string'
        ? values.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : (values.tags || []),
      createdAt: new Date().toISOString()
    };
    const data = readLocalData();
    saveLocalData({ ...data, posts: [post, ...data.posts] });
    return post;
  }
};

export { API_URL, TOKEN_KEY };