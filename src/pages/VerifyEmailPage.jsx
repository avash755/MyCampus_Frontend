import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerificationCode, registrationStatus, registrationError } = useAuth();
  const isSignupFlow = searchParams.get('signup') === '1';
  const registrationPending = isSignupFlow && ['pending', 'slow'].includes(registrationStatus);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [emailDeliveryFailed, setEmailDeliveryFailed] = useState(searchParams.get('emailSent') === 'failed');
  const [error, setError] = useState(emailDeliveryFailed
    ? 'Your account was created, but the verification email could not be sent. Request a new code after email delivery is available.'
    : '');

  const registrationMessage = registrationPending
    ? registrationStatus === 'slow'
      ? 'The server is taking longer than usual to respond. You can still enter your code below.'
      : 'Your account is being created. You can enter the code below as soon as it arrives.'
    : isSignupFlow && registrationStatus === 'ready'
      ? 'Your account is ready. Your verification code is being sent; if it does not arrive, request a new code.'
      : '';

  async function submit(event) {
    event.preventDefault();
    if (busyAction) return;
    setError('');
    setMessage('');
    setBusyAction('verify');
    try {
      await verifyEmail(email, code);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not verify this email.');
    } finally {
      setBusyAction('');
    }
  }

  async function resend() {
    if (busyAction) return;
    setError('');
    setMessage('');
    setBusyAction('resend');
    try {
      const result = await resendVerificationCode(email);
      setEmailDeliveryFailed(false);
      setMessage(result.message);
    } catch (err) {
      setError(err.message || 'Could not send a new code.');
    } finally {
      setBusyAction('');
    }
  }

  return (
    <main className="simple-auth-page">
      <section className="simple-auth-card">
        <Link to="/" className="brand-lockup">
          <span className="brand-mark"><Icon name="compass" size={20} /></span>
          <span className="brand-word">mycampus<span>.</span></span>
        </Link>
        <span className="section-eyebrow">ONE LAST STEP</span>
        <h1>Check your <em>inbox.</em></h1>
        <p>{registrationPending
          ? 'Your account setup is still running. The verification form is available below.'
          : emailDeliveryFailed
            ? 'Your account is saved. Request a verification code after email delivery is available.'
            : 'Enter the six-digit code we sent to your campus email.'}</p>

        {registrationMessage && <p className="form-success" role="status">{registrationMessage}</p>}
        {isSignupFlow && registrationStatus === 'error' && (
          <p className="form-error" role="alert">
            {registrationError || 'Account setup did not finish. You can still enter a code or try sending one again.'}
          </p>
        )}

        <form className="form-stack" onSubmit={submit}>
          <label className="field-label">
            Campus email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={registrationPending}
            />
          </label>
          <label className="field-label">
            Verification code
            <input
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength="6"
              pattern="[0-9]{6}"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
            />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p className="form-success" role="status">{message}</p>}
          <button className="button button-primary" disabled={busyAction !== ''}>
            {busyAction === 'verify' ? 'Checking…' : 'Verify email'} <Icon name="arrow" size={16} />
          </button>
        </form>
        <button className="text-action" onClick={resend} disabled={busyAction !== ''}>
          {busyAction === 'resend' ? 'Sending…' : 'Send a new code'}
        </button>
        <p className="simple-auth-foot"><Link to="/login">Back to sign in</Link></p>
      </section>
    </main>
  );
}
