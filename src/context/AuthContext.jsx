import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { campusService, API_URL } from '../services/campusService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const sessionRevision = useRef(0);

  function saveSession(nextUser) {
    sessionRevision.current += 1;
    setUser(nextUser);
    setAuthReady(true);
    return nextUser;
  }

  useEffect(() => {
    let active = true;
    const revision = sessionRevision.current;
    if (!API_URL) {
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
      })
      .finally(() => {
        if (active && revision === sessionRevision.current) setAuthReady(true);
      });

    return () => { active = false; };
  }, []);

  async function signIn(values) {
    sessionRevision.current += 1;
    setUser(null);
    setAuthReady(true);
    setLoading(true);
    try {
      const result = await campusService.signIn(values);
      return saveSession(result.user);
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
      saveSession(result.user);
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
    await signOut();
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

  async function signOut() {
    sessionRevision.current += 1;
    setUser(null);
    try { await campusService.signOut(); } catch { /* Clear local UI even if the API is unavailable. */ }
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
