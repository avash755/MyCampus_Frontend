import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campusService } from '../services/campusService';
import ModuleCountdown from '../components/ModuleCountdown';
import Icon from '../components/Icon';

function toLocalInput(date) {
  if (!date) return '';
  const value = new Date(date);
  if (!Number.isFinite(value.getTime())) return '';
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function newOfferingForm(templates) {
  const template = templates[0];
  return {
    templateNumber: template ? String(template.number) : 'custom',
    title: template?.title || '',
    durationDays: template?.durationDays || 1,
    scheduleLabel: template?.scheduleLabel || '3 to 4 hours',
    startsAt: '',
    fee: '',
    description: ''
  };
}

function templateLabel(number) {
  return number ? `MODULE ${String(number).padStart(2, '0')}` : 'CUSTOM MODULE';
}

function statusFor(offering) {
  if (!offering.published) return 'Draft';
  if (!offering.startsAt) return 'Schedule needed';
  const start = new Date(offering.startsAt).getTime();
  const end = start + Math.max(1, Number(offering.durationDays) || 1) * 86400000;
  if (Date.now() < start) return 'Scheduled';
  return Date.now() < end ? 'In progress' : 'Completed';
}

export default function ModuleAdminPage() {
  const [templates, setTemplates] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(null);
  const [createForm, setCreateForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [createError, setCreateError] = useState('');
  const [createNotice, setCreateNotice] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [reviewingId, setReviewingId] = useState('');

  async function load() {
    try {
      const result = await campusService.listAdminModules();
      const nextTemplates = result.templates || [];
      const nextOfferings = result.offerings || [];
      setTemplates(nextTemplates);
      setOfferings(nextOfferings);
      setCreateForm((current) => current || newOfferingForm(nextTemplates));
      setSelectedId((current) => current || nextOfferings[0]?._id || '');
    } catch (err) { setError(err.message || 'Could not load module management.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!selectedId) { setRegistrations([]); return undefined; }
    let active = true;
    setRegistrationLoading(true);
    setRegistrationError('');
    campusService.listModuleRegistrations(selectedId)
      .then((items) => { if (active) setRegistrations(items); })
      .catch((err) => { if (active) setRegistrationError(err.message || 'Could not load registration requests.'); })
      .finally(() => { if (active) setRegistrationLoading(false); });
    return () => { active = false; };
  }, [selectedId]);

  const selected = offerings.find((item) => item._id === selectedId);
  useEffect(() => {
    if (!selected) { setForm(null); return; }
    setForm({
      title: selected.title,
      durationDays: selected.durationDays,
      scheduleLabel: selected.scheduleLabel,
      description: selected.description || '',
      fee: selected.fee ?? '',
      startsAt: toLocalInput(selected.startsAt),
      published: selected.published
    });
  }, [selectedId]);

  function updateEdit(key, value) { setForm((current) => ({ ...current, [key]: value })); }
  function updateCreate(key, value) { setCreateForm((current) => ({ ...current, [key]: value })); }

  function selectTemplate(value) {
    const template = templates.find((item) => String(item.number) === value);
    setCreateForm((current) => ({
      ...current,
      templateNumber: value,
      title: template?.title || '',
      durationDays: template?.durationDays || 1,
      scheduleLabel: template?.scheduleLabel || '3 to 4 hours'
    }));
  }

  function payloadFrom(values, published) {
    return {
      ...values,
      templateNumber: values.templateNumber === 'custom' ? null : Number(values.templateNumber),
      startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : '',
      fee: values.fee === '' ? null : Number(values.fee),
      published
    };
  }

  async function createOffering(published) {
    if (!createForm) return;
    if (createForm.templateNumber === 'custom' && !createForm.title.trim()) {
      setCreateError('Add a name for your custom module.');
      return;
    }
    if (published && !createForm.startsAt) {
      setCreateError('Choose a start date and time before publishing.');
      return;
    }
    setSaving(true); setCreateError(''); setCreateNotice('');
    try {
      const created = await campusService.createModule(payloadFrom(createForm, published));
      setOfferings((current) => [...current, created].sort((a, b) => new Date(a.startsAt || 8640000000000000) - new Date(b.startsAt || 8640000000000000)));
      setSelectedId(created._id);
      setCreateNotice(published ? 'Module published. Students can request a place now.' : 'Draft saved. Add a start time and publish when it is ready.');
      setCreateForm(newOfferingForm(templates));
    } catch (err) { setCreateError(err.message || 'Could not create this module.'); }
    finally { setSaving(false); }
  }

  async function saveOffering(published) {
    if (!selected || !form) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const updated = await campusService.updateModule(selected._id, {
        ...form,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : '',
        fee: form.fee === '' ? null : Number(form.fee),
        published
      });
      setOfferings((current) => current.map((item) => item._id === updated._id ? updated : item));
      setNotice(published ? 'Module details saved and published.' : 'Module saved as a draft.');
    } catch (err) { setError(err.message || 'Could not save this module.'); }
    finally { setSaving(false); }
  }

  async function reviewRegistration(registration, status) {
    const moduleId = selectedId;
    setReviewingId(registration._id); setRegistrationError('');
    try {
      const updated = await campusService.reviewModuleRegistration(moduleId, registration._id, status);
      const next = registrations.map((item) => item._id === updated._id ? updated : item);
      setRegistrations(next);
      const accepted = next.filter((item) => item.status === 'accepted').length;
      const pending = next.filter((item) => item.status === 'pending').length;
      setOfferings((current) => current.map((item) => item._id === moduleId ? {
        ...item,
        registrationCount: accepted,
        acceptedRegistrationCount: accepted,
        pendingRegistrationCount: pending,
        totalRegistrationRequests: accepted + pending
      } : item));
    } catch (err) { setRegistrationError(err.message || 'Could not review this request.'); }
    finally { setReviewingId(''); }
  }

  async function refreshRegistrations() {
    if (!selectedId) return;
    setRegistrationLoading(true); setRegistrationError('');
    try { setRegistrations(await campusService.listModuleRegistrations(selectedId)); }
    catch (err) { setRegistrationError(err.message || 'Could not refresh requests.'); }
    finally { setRegistrationLoading(false); }
  }

  if (loading) return <div className="empty-panel"><p>Loading module management…</p></div>;

  return <div className="listing-page module-admin-page">
    <section className="page-intro module-admin-intro">
      <div><span className="section-eyebrow">CAMPUS ADMINISTRATION</span><h1>Module <em>management</em></h1><p>Schedule a run, then accept or decline student requests from its review panel.</p></div>
      <Link to="/app/modules" className="button button-quiet"><Icon name="book" size={17} /> Student view</Link>
    </section>

    <div className="module-admin-summary">
      <div><span className="module-summary-icon"><Icon name="book" size={19} /></span><span><strong>{templates.length}</strong><small>Reusable topics</small></span></div>
      <div><span className="module-summary-icon"><Icon name="calendar" size={19} /></span><span><strong>{offerings.length}</strong><small>Scheduled runs</small></span></div>
      <div><span className="module-summary-icon"><Icon name="clock" size={19} /></span><span><strong>{offerings.reduce((total, item) => total + (item.pendingRegistrationCount || 0), 0)}</strong><small>Requests to review</small></span></div>
      <div><span className="module-summary-icon"><Icon name="users" size={19} /></span><span><strong>{offerings.reduce((total, item) => total + (item.acceptedRegistrationCount ?? item.registrationCount ?? 0), 0)}</strong><small>Accepted students</small></span></div>
    </div>

    <section className="module-create-panel">
      <div className="module-panel-heading"><span className="module-panel-mark"><Icon name="calendar" size={20} /></span><div><span className="section-eyebrow">CREATE A NEW RUN</span><h2>Schedule a module</h2><p>Topics can be scheduled again whenever the campus needs them.</p></div></div>
      {templates.length ? <div className="module-create-form">
        <label className="field-label">Choose a topic
          <select value={createForm?.templateNumber || 'custom'} onChange={(event) => selectTemplate(event.target.value)}>
            {templates.map((item) => <option key={item.number} value={String(item.number)}>Module {String(item.number).padStart(2, '0')} · {item.title}</option>)}
            <option value="custom">Custom module</option>
          </select>
        </label>
        {createForm?.templateNumber === 'custom' && <label className="field-label">Custom module title<input value={createForm.title} maxLength="180" onChange={(event) => updateCreate('title', event.target.value)} placeholder="Name this module" /></label>}
        <div className="form-grid">
          <label className="field-label">Starts at<input type="datetime-local" value={createForm?.startsAt || ''} onChange={(event) => updateCreate('startsAt', event.target.value)} /></label>
          <label className="field-label">Duration (days)<input type="number" min="1" max="365" value={createForm?.durationDays || 1} onChange={(event) => updateCreate('durationDays', event.target.value)} /></label>
        </div>
        <div className="form-grid">
          <label className="field-label">Daily schedule<input value={createForm?.scheduleLabel || ''} maxLength="80" onChange={(event) => updateCreate('scheduleLabel', event.target.value)} placeholder="e.g. 3 to 4 hours" /></label>
          <label className="field-label">Fee (BDT, optional)<input type="number" min="0" value={createForm?.fee || ''} onChange={(event) => updateCreate('fee', event.target.value)} placeholder="Leave blank if not set" /></label>
        </div>
        <label className="field-label">Details for students<textarea rows="3" maxLength="2000" value={createForm?.description || ''} onChange={(event) => updateCreate('description', event.target.value)} placeholder="Room, instructions, or what students should bring" /></label>
        <div className="module-create-footer"><p>Registration stays open with no seat limit until the module begins.</p><div className="form-actions"><button type="button" className="button button-quiet" disabled={saving} onClick={() => createOffering(false)}>{saving ? 'Saving…' : 'Save draft'}</button><button type="button" className="button button-primary" disabled={saving} onClick={() => createOffering(true)}>{saving ? 'Saving…' : <><Icon name="check" size={16} /> Create and publish</>}</button></div></div>
      </div> : <div className="module-template-empty"><h3>Module topics are not loaded yet</h3><p>After connecting MongoDB, run the one-time migration with <code>npm run migrate</code> in the server folder.</p></div>}
      {createError && <p className="form-error">{createError}</p>}{createNotice && <p className="form-success">{createNotice}</p>}
    </section>

    <section className="module-offerings-section">
      <div className="module-offerings-title"><div><span className="section-eyebrow">YOUR SCHEDULE</span><h2>Published runs and drafts</h2></div><span>{offerings.length} total</span></div>
      <div className="module-admin-layout">
        <nav className="module-admin-list" aria-label="Scheduled modules">
          {offerings.length ? offerings.map((item) => <button type="button" key={item._id} className={selectedId === item._id ? 'module-admin-option is-selected' : 'module-admin-option'} onClick={() => { setSelectedId(item._id); setError(''); setNotice(''); }}>
            <span className="module-option-number">{item.number ? String(item.number).padStart(2, '0') : '✳'}</span><span className="module-option-copy"><strong>{item.title}</strong><small>{item.startsAt ? new Date(item.startsAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Date not set'} · {item.acceptedRegistrationCount ?? item.registrationCount ?? 0} accepted · {item.pendingRegistrationCount || 0} pending</small></span><i className={item.published ? 'published-dot' : 'draft-dot'} title={statusFor(item)} />
          </button>) : <div className="module-list-empty"><Icon name="calendar" size={21} /><p>Your scheduled runs and drafts will appear here.</p></div>}
        </nav>
        {selected && form ? <section className="module-admin-editor">
          <div className="module-admin-editor-head"><span className="module-number">{templateLabel(selected.number)}</span><span className={'module-status ' + (selected.published ? 'is-published' : '')}>{statusFor(selected)}</span></div>
          <h3 className="module-edit-heading">Edit scheduled run</h3>
          <label className="field-label">Module name<input value={form.title} maxLength="180" onChange={(event) => updateEdit('title', event.target.value)} /></label>
          <div className="form-grid"><label className="field-label">Starts at<input type="datetime-local" value={form.startsAt} onChange={(event) => updateEdit('startsAt', event.target.value)} /></label><label className="field-label">Duration (days)<input type="number" min="1" max="365" value={form.durationDays} onChange={(event) => updateEdit('durationDays', event.target.value)} /></label></div>
          <div className="form-grid"><label className="field-label">Daily schedule<input value={form.scheduleLabel} maxLength="80" onChange={(event) => updateEdit('scheduleLabel', event.target.value)} /></label><label className="field-label">Fee (BDT, optional)<input type="number" min="0" value={form.fee} onChange={(event) => updateEdit('fee', event.target.value)} placeholder="Leave blank if not set" /></label></div>
          <label className="field-label">Details for students<textarea rows="3" maxLength="2000" value={form.description} onChange={(event) => updateEdit('description', event.target.value)} placeholder="Location, instructions, or what students should bring" /></label>
          <div className="module-admin-count"><Icon name="users" size={19} /><span><strong>{selected.acceptedRegistrationCount ?? selected.registrationCount ?? 0} accepted students</strong><small>{selected.pendingRegistrationCount || 0} requests waiting · no seat limit</small></span></div>
          <section className="module-registration-review">
            <div className="module-registration-heading"><div><span className="section-eyebrow">REGISTRATION REVIEW</span><h3>Registration requests</h3></div><button type="button" className="button button-quiet button-small" onClick={refreshRegistrations} disabled={registrationLoading}>{registrationLoading ? 'Refreshing…' : 'Refresh'}</button></div>
            {registrationError && <p className="form-error">{registrationError}</p>}
            {registrationLoading && !registrations.length ? <p className="module-review-empty">Loading student requests…</p> : <>
              <div className="module-registration-group"><div className="module-registration-group-title"><strong>Awaiting review</strong><span>{registrations.filter((item) => item.status === 'pending').length}</span></div>
                {registrations.filter((item) => item.status === 'pending').length ? registrations.filter((item) => item.status === 'pending').map((item) => <article className="module-registration-row" key={item._id}>
                  <span className="module-registration-avatar">{item.student?.name?.slice(0, 1) || 'S'}</span><span className="module-registration-student"><strong>{item.student?.name || 'Student'}</strong><small>{[item.student?.studentId, item.student?.department].filter(Boolean).join(' · ') || 'Campus student'} · requested {new Date(item.createdAt).toLocaleDateString()}</small></span>
                  <span className="module-review-actions"><button type="button" className="button button-primary button-small" disabled={Boolean(reviewingId)} onClick={() => reviewRegistration(item, 'accepted')}>{reviewingId === item._id ? 'Saving…' : 'Accept'}</button><button type="button" className="button button-quiet button-small" disabled={Boolean(reviewingId)} onClick={() => reviewRegistration(item, 'rejected')}>Decline</button></span>
                </article>) : <p className="module-review-empty">No requests are waiting for review.</p>}
              </div>
              <details className="module-registration-history"><summary>Accepted students ({registrations.filter((item) => item.status === 'accepted').length})</summary>{registrations.filter((item) => item.status === 'accepted').map((item) => <div className="module-registration-row is-read-only" key={item._id}><span className="module-registration-avatar"><Icon name="check" size={15} /></span><span className="module-registration-student"><strong>{item.student?.name || 'Student'}</strong><small>{[item.student?.studentId, item.student?.department].filter(Boolean).join(' · ') || 'Campus student'}</small></span><span className="module-status is-published">Accepted</span></div>)}</details>
              {registrations.some((item) => item.status === 'rejected') && <p className="module-declined-note">{registrations.filter((item) => item.status === 'rejected').length} declined request(s). Students can submit a new request.</p>}
            </>}
          </section>
          <ModuleCountdown startsAt={form.startsAt} durationDays={form.durationDays} />
          {error && <p className="form-error">{error}</p>}{notice && <p className="form-success">{notice}</p>}
          <div className="form-actions"><button type="button" className="button button-quiet" disabled={saving} onClick={() => saveOffering(Boolean(selected.published))}>{saving ? 'Saving…' : 'Save changes'}</button><button type="button" className="button button-primary" disabled={saving || (!selected.published && !form.startsAt)} onClick={() => saveOffering(!selected.published)}>{saving ? 'Saving…' : selected.published ? 'Unpublish run' : <><Icon name="check" size={16} /> Publish run</>}</button></div>
        </section> : <div className="module-admin-placeholder"><Icon name="calendar" size={24} /><h3>Select a scheduled run</h3><p>Choose a draft or published module to review its schedule, registrations, and student details.</p></div>}
      </div>
    </section>
  </div>;
}





