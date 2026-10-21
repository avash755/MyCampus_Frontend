import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

export default function LoginPage() {
  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', studentId: '' });

  function update(key, value) { setForm((current) => ({ ...current, [key]: value })); }

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      if (isSignup) {
        await signUp(form);
        navigate('/verify-email?email=' + encodeURIComponent(form.email));
      } else {
        await signIn(form);
        navigate('/app');
      }
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-email?email=' + encodeURIComponent(form.email));
        return;
      }
      setError(err.message || 'Could not sign in. Please try again.');
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-story">
        <Link to="/" className="brand-lockup auth-brand"><span className="brand-mark"><Icon name="compass" size={21} /></span><span className="brand-word">mycampus<span>.</span></span></Link>
        <div className="auth-story-content">
          <span className="eyebrow auth-eyebrow"><span className="eyebrow-dot" /> YOUR CAMPUS, A LITTLE CLOSER</span>
          <h1>Good things<br />happen <em>together.</em></h1>
          <p>A calmer way to find your people, your next event, and the little things that make campus feel like yours.</p>
          <div className="auth-story-art">
            <div className="auth-art-circle auth-circle-one" /><div className="auth-art-circle auth-circle-two" />
            <div className="auth-story-card"><span className="auth-story-icon"><Icon name="calendar" /></span><div><small>UP NEXT · THIS WEEK</small><strong>Designing for a better campus</strong><span>Innovation Lab · 2:30 PM</span></div><Icon name="arrow" size={17} /></div>
            <div className="auth-story-note"><Icon name="sparkle" size={17} /> Your campus, a little closer.</div>
          </div>
        </div>
        <div className="auth-story-footer"><span>© MyCampus</span><span>A student community space</span></div>
      </aside>

      <main className="auth-main">
        <div className="auth-form-wrap">
          <Link to="/" className="auth-mobile-brand"><span className="brand-mark"><Icon name="compass" size={20} /></span><span className="brand-word">mycampus<span>.</span></span></Link>
          <div className="auth-heading"><span className="auth-heading-kicker">{isSignup ? 'GET STARTED' : 'WELCOME BACK'}</span><h2>{isSignup ? 'Join your campus.' : 'Come on in.'}</h2><p>{isSignup ? 'Create your student account to get connected.' : 'Sign in to find what is happening around you.'}</p></div>

          {searchParams.get('reset') === 'success' && <p className="form-success">Your password has been updated. Sign in with your new password.</p>}
          <form className="auth-form" onSubmit={submit}>
            {isSignup && <label className="field-label">Your name<input required autoComplete="name" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="e.g. Sam Taylor" /></label>}
            <label className="field-label">Campus email<input required type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@college.edu" /></label>
            {isSignup && <div className="form-grid">
              <label className="field-label">Department<input value={form.department} onChange={(event) => update('department', event.target.value)} placeholder="Computer Science" /></label>
              <label className="field-label">Student ID<input value={form.studentId} onChange={(event) => update('studentId', event.target.value)} placeholder="Optional" /></label>
            </div>}
            <label className="field-label">Password<input required type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={isSignup ? 8 : undefined} value={form.password} onChange={(event) => update('password', event.target.value)} placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'} /></label>
            {error && <p className="form-error">{error}</p>}
            <button className="button button-primary auth-submit" disabled={loading}>{loading ? 'One moment…' : isSignup ? 'Create account' : 'Sign in'} <Icon name="arrow" size={16} /></button>
          </form>
          {!isSignup && <p className="auth-forgot"><Link to="/forgot-password">Forgot password?</Link></p>}
          <p className="auth-switch">{isSignup ? 'Already a member?' : 'New to MyCampus?'} <button onClick={() => { setIsSignup(!isSignup); setError(''); }}>{isSignup ? 'Sign in' : 'Create an account'}</button></p>
          <div className="auth-safe"><Icon name="shield" size={15} /> A friendly, student-first community space.</div>
        </div>
      </main>
    </div>
  );
}
