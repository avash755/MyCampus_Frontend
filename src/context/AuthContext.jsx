import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { campusService, API_URL, TOKEN_KEY } from '../services/campusService';

const AuthContext = createContext(null);
const USER_KEY = 'mycampus-user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const sessionRevision = useRef(0);

  function saveSession(nextUser, token) {
    sessionRevision.current += 1;
    setUser(nextUser);
    setAuthReady(true);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else if (token === null) localStorage.removeItem(TOKEN_KEY);
    return nextUser;
  }

  useEffect(() => {
    let active = true;
    const revision = sessionRevision.current;
    const token = localStorage.getItem(TOKEN_KEY);

    if (!API_URL || !token) {
      localStorage.removeItem(USER_KEY);
      if (!API_URL) localStorage.removeItem(TOKEN_KEY);
      setAuthReady(true);
      return () => { active = false; };
    }

    campusService.currentUser()
      .then(({ user: verifiedUser }) => {
        if (!active || revision !== sessionRevision.current) return;
        setUser(verifiedUser);
      })
      .catch(() => {
        if (!active || revision !== sessionRevision.current) return;
        setUser(null);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => {
        if (active && revision === sessionRevision.current) setAuthReady(true);
      });

    return () => { active = false; };
  }, []);

  async function signIn(values) {
    sessionRevision.current += 1;
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setAuthReady(true);
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
      return await campusService.signUp(values);
    } finally {
      setLoading(false);
    }
  }

  async function verifyEmail(email, code) {
    sessionRevision.current += 1;
    setAuthReady(true);
    setLoading(true);
    try {
      const result = await campusService.verifyEmail(email, code);
      saveSession(result.user, result.token);
      return result;
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(values) {
    const nextUser = await campusService.updateProfile(values);
    return saveSession(nextUser);
  }

  async function deleteProfile(password) {
    await campusService.deleteProfile(password);
    signOut();
  }

  async function runAuthAction(action) {
    setLoading(true);
    try { return await action(); }
    finally { setLoading(false); }
  }

  function resendVerificationCode(email) { return runAuthAction(() => campusService.resendVerificationCode(email)); }
  function requestPasswordReset(email) { return runAuthAction(() => campusService.requestPasswordReset(email)); }
  function verifyResetCode(email, code) { return runAuthAction(() => campusService.verifyResetCode(email, code)); }
  function setNewPassword(password) { return runAuthAction(() => campusService.setNewPassword(password)); }

  function signOut() {
    sessionRevision.current += 1;
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  const value = useMemo(() => ({
    user, loading, authReady, signIn, signUp, verifyEmail, updateProfile, deleteProfile, signOut,
    requestPasswordReset, resendVerificationCode, verifyResetCode, setNewPassword
  }), [user, loading, authReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
