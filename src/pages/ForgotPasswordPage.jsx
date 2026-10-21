import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

export default function ForgotPasswordPage() {
  const { requestPasswordReset, verifyResetCode, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function send(event) {
    event.preventDefault(); setError('');
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
      setStep('code');
    } catch (err) { setError(err.message || 'Could not send a reset code.'); }
  }

  async function verify(event) {
    event.preventDefault(); setError('');
    try {
      const result = await verifyResetCode(email, code);
      sessionStorage.setItem('mycampus-reset-email', email);
      setMessage(result.message);
      setStep('verified');
    } catch (err) { setError(err.message || 'Could not verify that code.'); }
  }

  return <main className="simple-auth-page"><section className="simple-auth-card"><Link to="/" className="brand-lockup"><span className="brand-mark"><Icon name="compass" size={20} /></span><span className="brand-word">mycampus<span>.</span></span></Link><span className="section-eyebrow">ACCOUNT RECOVERY</span><h1>{step === 'email' ? <>Forgot your <em>password?</em></> : <>Reset your <em>password.</em></>}</h1><p>{step === 'email' ? 'We will send a short-lived code to the email on your account.' : 'Enter the six-digit code sent to your email. It expires in 10 minutes.'}</p>{step === 'email' ? <form className="form-stack" onSubmit={send}><label className="field-label">Campus email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@college.edu" /></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary" disabled={loading}>{loading ? 'Sending…' : 'Send reset code'} <Icon name="arrow" size={16} /></button></form> : <form className="form-stack" onSubmit={verify}><label className="field-label">Campus email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="field-label">Reset code<input required inputMode="numeric" maxLength="6" pattern="[0-9]{6}" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" /></label>{message && <p className="form-success">{message}</p>}{error && <p className="form-error">{error}</p>}<button className="button button-primary" disabled={loading || step === 'verified'}>{loading ? 'Checking…' : step === 'verified' ? 'Code verified' : 'Verify code'} <Icon name="arrow" size={16} /></button>{step === 'verified' && <Link className="button button-primary" to="/reset-password">Choose a new password <Icon name="arrow" size={16} /></Link>}</form>}<p className="simple-auth-foot"><Link to="/login">Back to sign in</Link></p></section></main>;
}
