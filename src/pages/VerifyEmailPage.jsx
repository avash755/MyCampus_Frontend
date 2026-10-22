import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerificationCode, loading, registrationStatus, registrationError } = useAuth();
  const isSignupFlow = searchParams.get('signup') === '1';
  const registrationPending = isSignupFlow && ['pending', 'slow'].includes(registrationStatus);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [emailDeliveryFailed, setEmailDeliveryFailed] = useState(searchParams.get('emailSent') === 'failed');
  const [error, setError] = useState(emailDeliveryFailed
    ? 'Your account was created, but the verification email could not be sent. Fix email delivery, then request a new code.'
    : '');

  const registrationMessage = registrationPending
    ? registrationStatus === 'slow'
      ? 'The server is taking longer than usual to wake up. This page is ready; we are still creating your account.'
      : 'Creating your account. The code form will be ready as soon as the server responds.'
    : isSignupFlow && registrationStatus === 'ready'
      ? 'Your account is ready. Your verification code is being sent; check spam or request a new code if it does not arrive.'
      : '';

  async function submit(event) {
    event.preventDefault();
    setError(''); setMessage('');
    try {
      await verifyEmail(email, code);
      navigate('/app', { replace: true });
    } catch (err) { setError(err.message || 'Could not verify this email.'); }
  }

  async function resend() {
    setError(''); setMessage('');
    try { const result = await resendVerificationCode(email); setEmailDeliveryFailed(false); setMessage(result.message); }
    catch (err) { setError(err.message || 'Could not send a new code.'); }
  }

  return <main className="simple-auth-page"><section className="simple-auth-card"><Link to="/" className="brand-lockup"><span className="brand-mark"><Icon name="compass" size={20} /></span><span className="brand-word">mycampus<span>.</span></span></Link><span className="section-eyebrow">ONE LAST STEP</span><h1>Check your <em>inbox.</em></h1><p>{registrationPending ? 'Your account setup is in progress.' : emailDeliveryFailed ? 'Your account is saved. Request a verification code after email delivery is available.' : 'Enter the six-digit code we sent to your campus email.'}</p>{registrationMessage && <p className="form-success" role="status">{registrationMessage}</p>}{isSignupFlow && registrationStatus === 'error' && <p className="form-error" role="alert">{registrationError || 'Could not create your account. You can try sending a code if the account was already created.'}</p>}<form className="form-stack" onSubmit={submit}><label className="field-label">Campus email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={registrationPending} /></label><label className="field-label">Verification code<input required inputMode="numeric" autoComplete="one-time-code" maxLength="6" pattern="[0-9]{6}" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" disabled={registrationPending} /></label>{error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}<button className="button button-primary" disabled={loading || registrationPending}>{registrationPending ? 'Creating account…' : loading ? 'Checking…' : 'Verify email'} <Icon name="arrow" size={16} /></button></form><button className="text-action" onClick={resend} disabled={loading || registrationPending}>Send a new code</button><p className="simple-auth-foot"><Link to="/login">Back to sign in</Link></p></section></main>;
}
