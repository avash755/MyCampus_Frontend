import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

export default function ResetPasswordPage() {
  const { setNewPassword, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault(); setError('');
    if (password !== confirm) return setError('Those passwords do not match.');
    try {
      await setNewPassword(password);
      sessionStorage.removeItem('mycampus-reset-email');
      navigate('/login?reset=success', { replace: true });
    } catch (err) { setError(err.message || 'Could not update your password.'); }
  }

  return <main className="simple-auth-page"><section className="simple-auth-card"><Link to="/" className="brand-lockup"><span className="brand-mark"><Icon name="compass" size={20} /></span><span className="brand-word">mycampus<span>.</span></span></Link><span className="section-eyebrow">NEW PASSWORD</span><h1>Make it <em>yours.</em></h1><p>Choose a strong password you have not used for this account.</p><form className="form-stack" onSubmit={submit}><label className="field-label">New password<input required type="password" minLength="8" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label><label className="field-label">Confirm password<input required type="password" minLength="8" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Enter it again" /></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary" disabled={loading}>{loading ? 'Saving…' : 'Save new password'} <Icon name="arrow" size={16} /></button></form><p className="simple-auth-foot"><Link to="/login">Back to sign in</Link></p></section></main>;
}
