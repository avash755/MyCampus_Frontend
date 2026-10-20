import { createContext, useContext, useMemo, useState } from 'react';
import { campusService, TOKEN_KEY } from '../services/campusService';
import { demoAdmin, demoStudent } from '../data/demoData';

const AuthContext = createContext(null);
const USER_KEY = 'mycampus-user';

function readSavedUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);
  const [loading, setLoading] = useState(false);

  function saveSession(nextUser, token) {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    return nextUser;
  }

  async function signIn(values) {
    setLoading(true);
    try {
      const result = await campusService.signIn(values);
      return saveSession(result.user, result.token);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(values) {
    setLoading(true);
    try {
      const result = await campusService.signUp(values);
      return saveSession(result.user, result.token);
    } finally {
      setLoading(false);
    }
  }

  async function enterDemo(role = 'student') {
    setLoading(true);
    try {
      const isAdmin = role === 'admin';
      const account = isAdmin ? demoAdmin : demoStudent;
      if (import.meta.env.VITE_API_URL) {
        try {
          const result = await campusService.signIn({ email: account.email, password: 'Campus123!' });
          return saveSession(result.user, result.token);
        } catch (err) {
          console.info('Demo database is not seeded yet. Opening the local preview.');
        }
      }
      return saveSession(account);
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  const value = useMemo(() => ({
    user,
    loading,
    signIn,
    signUp,
    enterDemo,
    signOut
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}