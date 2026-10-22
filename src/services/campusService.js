const API_URL = (
  import.meta.env.PROD
    ? window.location.origin
    : (import.meta.env.VITE_API_URL || '')
).replace(/\/$/, '');

function requireBackend() {
  if (!API_URL) throw new Error('The backend is not configured. Set VITE_API_URL in client/.env and restart Vite.');
}

async function request(path, options = {}) {
  requireBackend();
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  const response = await fetch(API_URL + '/api' + path, {
    ...options,
    credentials: 'include',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'The request could not be completed.');
    error.code = data.code;
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

const toId = (value) => String(value?.id || value?._id || value || '');

export const campusService = {
  async signIn({ email, password }) {
    return request('/auth/login', { method: 'POST', body: { email, password } });
  },

  async signOut() {
    return request('/auth/logout', { method: 'POST' });
  },

  async signUp(values) {
    return request('/auth/register', { method: 'POST', body: values });
  },

  async currentUser() {
    return request('/auth/me');
  },

  async verifyEmail(email, code) {
    return request('/auth/user-verification', { method: 'POST', body: { email, code } });
  },

  async resendVerificationCode(email) {
    return request('/auth/send-otp', { method: 'POST', body: { email } });
  },

  async requestPasswordReset(email) {
    return request('/auth/change-password', { method: 'POST', body: { email } });
  },

  async verifyResetCode(email, code) {
    return request('/auth/verify-changes', { method: 'POST', body: { email, code } });
  },

  async setNewPassword(password) {
    return request('/auth/new-password', { method: 'POST', body: { password } });
  },

  async updateProfile(values) {
    return (await request('/auth/me', { method: 'PATCH', body: values })).user;
  },

  async deleteProfile(password) {
    return request('/auth/me', { method: 'DELETE', body: { password } });
  },

  async loadWorkspace() {
    const [eventData, postData] = await Promise.all([request('/events'), request('/posts')]);
    return { events: eventData.events || [], posts: postData.posts || [] };
  },

  async createEvent(values) {
    return (await request('/events', { method: 'POST', body: values })).event;
  },

  async deleteEvent(id) {
    return request('/events/' + id, { method: 'DELETE' });
  },

  async registerForEvent(event, user) {
    const attendees = event.attendees || [];
    const registered = attendees.some((person) => toId(person) === toId(user));
    const action = registered ? 'leave' : 'join';
    return request('/events/' + event._id + '/register', { method: 'POST', body: { action } });
  },

  async createPost(values) {
    return (await request('/posts', { method: 'POST', body: values })).post;
  },

  async loadModeration(status = 'pending') {
    const result = await request('/posts/moderation?status=' + encodeURIComponent(status));
    return result.posts || [];
  },

  async moderatePost(id, action, featured) {
    const body = action === 'feature' ? { action, featured } : { action };
    return (await request('/posts/' + id + '/moderation', { method: 'PATCH', body })).post;
  },

  async deletePost(id) {
    return request('/posts/' + id, { method: 'DELETE' });
  }
};

export { API_URL };
