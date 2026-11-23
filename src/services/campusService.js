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
  const { timeoutMs, ...fetchOptions } = options;
  const headers = { 'Content-Type': 'application/json', ...fetchOptions.headers };

  let response;
  try {
    response = await fetch(API_URL + '/api' + path, {
      ...fetchOptions,
      credentials: 'include',
      headers,
      body: fetchOptions.body ? JSON.stringify(fetchOptions.body) : undefined,
      signal: fetchOptions.signal || (timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined)
    });
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error('The server took too long to respond. Your account may have been created; try requesting a verification code again.');
    }
    if (err instanceof TypeError) {
      throw new Error(import.meta.env.PROD
        ? 'Could not reach the MyCampus API. Check that this Vercel deployment uses the MyCampus client and forwards /api to the Render backend.'
        : 'Could not reach the MyCampus API. Check that the server is running at ' + API_URL + '.');
    }
    throw err;
  }
  const contentType = response.headers.get('content-type') || '';
  const responseBody = await response.text();
  let data = {};
  try { data = responseBody ? JSON.parse(responseBody) : {}; }
  catch { data = { raw: responseBody }; }
  if (contentType.includes('text/html') || responseBody.includes('DEPLOYMENT_NOT_FOUND')) {
    throw new Error('This Vercel deployment is not forwarding /api requests to MyCampus. Check that the MyCampus client is deployed and its /api rewrite is active.');
  }
  if (!response.ok) {
    const routeMissing = response.status === 404 && data.message === 'That API route was not found.';
    const message = routeMissing
      ? 'Event chat is not available on this API server yet. Update the MyCampus backend and confirm this client is connected to it.'
      : data.message || 'The MyCampus API returned an error. Please try again.';
    const error = new Error(message);
    error.code = data.code;
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const campusService = {
  async signIn({ email, password }) {
    return request('/auth/login', { method: 'POST', body: { email, password } });
  },

  async signOut() {
    return request('/auth/logout', { method: 'POST' });
  },

  async signUp(values) {
    return request('/auth/register', { method: 'POST', body: values, timeoutMs: 90000 });
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

  async loadWorkspace({ eventPage = 1, postPage = 1, myPostsPage = 1 } = {}) {
    const [eventData, postData, myPostData] = await Promise.all([
      request(`/events?page=${eventPage}&limit=30`),
      request(`/posts?page=${postPage}&limit=30`),
      request(`/posts/mine?page=${myPostsPage}&limit=30`)
    ]);
    return {
      events: eventData.events || [], posts: postData.posts || [], myPosts: myPostData.posts || [],
      eventPagination: eventData.pagination || { page: eventPage, hasMore: false },
      postPagination: postData.pagination || { page: postPage, hasMore: false },
      myPostsPagination: myPostData.pagination || { page: myPostsPage, hasMore: false }
    };
  },

  async loadMemberProfile(id, page = 1) {
    return request(`/members/${encodeURIComponent(id)}?page=${page}&limit=30`);
  },

  async loadEvents(page = 1) {
    return request(`/events?page=${page}&limit=30`);
  },

  async loadPosts(page = 1) {
    return request(`/posts?page=${page}&limit=30`);
  },

  async loadMyPosts(page = 1) {
    return request(`/posts/mine?page=${page}&limit=30`);
  },

  async loadNotifications() {
    return request('/notifications');
  },

  async markNotificationRead(id) {
    return request('/notifications/' + id + '/read', { method: 'PATCH' });
  },

  async markAllNotificationsRead() {
    return request('/notifications/read-all', { method: 'PATCH' });
  },

  async createEvent(values) {
    return (await request('/events', { method: 'POST', body: values })).event;
  },

  async getEvent(id) {
    return (await request('/events/' + id)).event;
  },

  async deleteEvent(id) {
    return request('/events/' + id, { method: 'DELETE' });
  },

  async registerForEvent(event) {
    const action = event.isRegistered ? 'leave' : 'join';
    return request('/events/' + event._id + '/register', { method: 'POST', body: { action } });
  },

  async listEventMessages(id, after) {
    const cursor = after ? `?after=${encodeURIComponent(after.createdAt)}&afterId=${encodeURIComponent(after.id)}` : '';
    const result = await request('/events/' + id + '/messages' + cursor);
    return result.messages || [];
  },

  async sendEventMessage(id, body) {
    return (await request('/events/' + id + '/messages', { method: 'POST', body: { body } })).message;
  },

  async createPost(values) {
    return (await request('/posts', { method: 'POST', body: values })).post;
  },

  async loadModeration(status = 'pending', page = 1) {
    return request(`/posts/moderation?status=${encodeURIComponent(status)}&page=${page}&limit=30`);
  },

  async moderatePost(id, action, featured) {
    const body = action === 'feature' ? { action, featured } : { action };
    return (await request('/posts/' + id + '/moderation', { method: 'PATCH', body })).post;
  },

  async deletePost(id) {
    return request('/posts/' + id, { method: 'DELETE' });
  },

  async listModules() {
    const result = await request('/modules');
    return result.modules || [];
  },
  async getModule(id) {
    return (await request('/modules/' + id)).module;
  },
  async listAdminModules() {
    const result = await request('/modules/admin');
    return { templates: result.templates || [], offerings: result.offerings || [] };
  },
  async createModule(values) {
    return (await request('/modules', { method: 'POST', body: values })).module;
  },
  async updateModule(id, values) {
    return (await request('/modules/' + id, { method: 'PATCH', body: values })).module;
  },
  async registerForModule(id) {
    return request('/modules/' + id + '/registrations', { method: 'POST', body: {} });
  },
  async unregisterFromModule(id) {
    return request('/modules/' + id + '/registrations', { method: 'DELETE' });
  },
  async listModuleRegistrations(id) {
    const result = await request('/modules/' + id + '/registrations');
    return result.registrations || [];
  },
  async reviewModuleRegistration(id, registrationId, status) {
    return (await request('/modules/' + id + '/registrations/' + registrationId, { method: 'PATCH', body: { status } })).registration;
  },
  async listModuleMessages(id, after) {
    const cursor = after ? `?after=${encodeURIComponent(after.createdAt)}&afterId=${encodeURIComponent(after.id)}` : '';
    const result = await request('/modules/' + id + '/messages' + cursor);
    return result.messages || [];
  },
  async sendModuleMessage(id, body) {
    return (await request('/modules/' + id + '/messages', { method: 'POST', body: { body } })).message;
  }
};

export { API_URL };
