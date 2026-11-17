import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { campusService } from '../services/campusService';
import { useAuth } from '../context/AuthContext';
import ModuleCountdown from '../components/ModuleCountdown';
import ModuleChat from '../components/ModuleChat';
import Icon from '../components/Icon';

const topicLabel = (number) => number ? `MODULE ${String(number).padStart(2, '0')}` : 'CUSTOM MODULE';

export default function ModuleDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try { setModule(await campusService.getModule(id)); }
    catch (err) { setError(err.message || 'Could not load this module.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { setLoading(true); setError(''); load(); }, [id]);
  useEffect(() => {
    if (module?.registrationStatus !== 'pending') return undefined;
    let active = true;
    const timer = window.setInterval(async () => {
      try {
        const latest = await campusService.getModule(id);
        if (active) setModule(latest);
      } catch { /* Keep the current pending state; the student can refresh manually. */ }
    }, 10000);
    return () => { active = false; window.clearInterval(timer); };
  }, [id, module?.registrationStatus]);

  async function toggleRegistration() {
    setBusy(true); setError('');
    try {
      const result = module.registrationStatus === 'pending'
        ? await campusService.unregisterFromModule(id)
        : await campusService.registerForModule(id);
      setModule((current) => ({
        ...current,
        isRegistered: result.registered,
        registrationStatus: result.status || null,
        registrationCount: result.registrationCount,
        acceptedRegistrationCount: result.acceptedRegistrationCount,
        pendingRegistrationCount: result.pendingRegistrationCount
      }));
    } catch (err) { setError(err.message || 'Could not update registration.'); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="empty-panel"><p>Loading module…</p></div>;
  if (!module) return <div className="empty-panel"><h3>Module unavailable</h3><p>{error || 'This module may not have been published yet.'}</p><Link className="text-action" to="/app/modules">Back to modules</Link></div>;

  const started = module.startsAt && new Date(module.startsAt).getTime() <= Date.now();
  const isAdmin = user?.role === 'admin';
  const isPending = module.registrationStatus === 'pending';
  const isAccepted = module.registrationStatus === 'accepted';
  const isRejected = module.registrationStatus === 'rejected';
  const showChat = isAccepted || isAdmin;

  return <div className="module-detail-page">
    <Link to="/app/modules" className="module-back-link">← All modules</Link>
    <section className="module-detail-hero"><div><span className="module-number">{topicLabel(module.number)}</span><h1>{module.title}</h1><p>{module.description || 'A skill-building session published by your campus administrator.'}</p></div><ModuleCountdown startsAt={module.startsAt} durationDays={module.durationDays} /></section>
    <div className="module-detail-layout"><main className="module-detail-main">
      <section className="module-info-card"><h2>Module information</h2><div className="module-info-grid"><div><span>Starts</span><strong>{module.startsAt ? new Date(module.startsAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Schedule coming soon'}</strong></div><div><span>Duration</span><strong>{module.durationDays} {module.durationDays === 1 ? 'day' : 'days'}</strong></div><div><span>Daily schedule</span><strong>{module.scheduleLabel}</strong></div><div><span>Fee</span><strong>{module.fee == null ? 'Not set' : new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(module.fee)}</strong></div></div></section>
      {showChat ? <ModuleChat moduleId={id} /> : <section className="module-chat-locked">
        <span><Icon name={isPending ? 'clock' : 'users'} size={21} /></span>
        <h2>{isPending ? 'Waiting for admin approval' : isRejected ? 'Request declined' : 'Join the module group'}</h2>
        <p>{isPending
          ? 'Your request is with the campus admin. You can cancel while it is pending. Once accepted, your place is confirmed and cannot be cancelled in MyCampus.'
          : isRejected
            ? 'The campus admin declined this request. You can submit a new request if you still want to join.'
            : 'The group is a private place for accepted students and the campus admin to ask questions and share module updates. Send a request to join.'}</p>
        <button className={isPending ? 'button button-quiet' : 'button button-primary'} disabled={busy || (!isPending && started)} onClick={toggleRegistration}>
          {busy ? 'Please wait…' : isPending ? 'Cancel pending request' : isRejected ? started ? 'Registration closed' : 'Request again' : started ? 'Registration closed' : 'Request to join'}
        </button>
      </section>}
    </main><aside className="module-detail-aside"><div className="module-register-card">
      <span className="module-people-large"><Icon name="users" size={20} />{module.acceptedRegistrationCount ?? module.registrationCount ?? 0}</span>
      <h2>Accepted students</h2><p>There is no seat limit. The admin reviews requests before students enter the group.</p>
      {isAdmin ? <Link className="button button-primary" to="/app/modules/manage">Review module requests</Link> : isAccepted
        ? <p className="module-joined-note"><Icon name="check" size={15} /> Accepted. You can’t cancel this registration in MyCampus.</p>
        : isPending ? <p className="module-pending-note"><Icon name="clock" size={15} /> Request sent · waiting for review</p>
          : <span className="module-pending-note">{module.pendingRegistrationCount || 0} requests awaiting approval</span>}
    </div></aside></div>
    {error && <p className="form-error">{error}</p>}
  </div>;
}
