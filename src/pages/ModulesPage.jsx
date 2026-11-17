import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campusService } from '../services/campusService';
import { useAuth } from '../context/AuthContext';
import ModuleCountdown from '../components/ModuleCountdown';
import Icon from '../components/Icon';

const feeLabel = (fee) => fee == null ? 'Fee not set' : new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(fee);
const topicLabel = (number) => number ? `MODULE ${String(number).padStart(2, '0')}` : 'CUSTOM MODULE';

function offeringState(item) {
  if (!item.startsAt) return 'Schedule coming soon';
  const start = new Date(item.startsAt).getTime();
  const end = start + Math.max(1, Number(item.durationDays) || 1) * 86400000;
  if (Date.now() < start) return 'Upcoming';
  if (Date.now() < end) return 'In progress';
  return 'Completed';
}

export default function ModulesPage() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    campusService.listModules().then((data) => { if (active) setModules(data); })
      .catch((err) => { if (active) setError(err.message || 'Could not load modules.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visible = modules.filter((item) => {
    const end = item.startsAt ? new Date(item.startsAt).getTime() + Math.max(1, Number(item.durationDays) || 1) * 86400000 : Infinity;
    return end > Date.now() && item.title.toLowerCase().includes(query.toLowerCase());
  });

  return <div className="listing-page modules-page">
    <section className="page-intro module-page-intro">
      <div><span className="section-eyebrow">MYCAMPUS · CAMPUS SKILLS</span><h1>Build skills, <em>one module at a time.</em></h1><p>Explore upcoming campus sessions, preregister, and connect with the students joining you.</p></div>
      {user?.role === 'admin' && <Link to="/app/modules/manage" className="button button-primary"><Icon name="calendar" size={17} /> Manage modules</Link>}
    </section>
    <div className="module-trust-note"><Icon name="users" size={19} /><span><strong>Request a place</strong> · No seat limit. Admin approval is needed before students enter the group.</span></div>
    <label className="module-search"><Icon name="search" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search upcoming modules" /></label>
    {error && <p className="form-error">{error}</p>}
    {loading ? <div className="empty-panel"><p>Loading modules…</p></div> : visible.length ? <div className="module-grid">{visible.map((module) => <article className="module-card" key={module._id}>
      <div className="module-card-top"><span className="module-number">{topicLabel(module.number)}</span><span className={'module-run-state ' + (offeringState(module) === 'In progress' ? 'is-live' : '')}><i />{offeringState(module)}</span></div>
      <h2>{module.title}</h2>
      <p className="module-card-date"><Icon name="calendar" size={16} />{module.startsAt ? new Date(module.startsAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Schedule coming soon'}</p>
      <div className="module-card-facts"><span><Icon name="clock" size={15} /> {module.durationDays} {module.durationDays === 1 ? 'day' : 'days'}</span><span><Icon name="users" size={15} /> {module.acceptedRegistrationCount ?? module.registrationCount ?? 0} accepted</span></div>
      <ModuleCountdown startsAt={module.startsAt} durationDays={module.durationDays} compact />
      <div className="module-card-bottom"><span>{feeLabel(module.fee)}</span><Link to={'/app/modules/' + module._id} className="button button-primary button-small">View details <Icon name="arrow" size={15} /></Link></div>
    </article>)}</div> : <div className="empty-panel"><h3>{query ? 'No matching modules' : 'No upcoming modules yet'}</h3><p>{query ? 'Try another search.' : user?.role === 'admin' ? 'Open module management to schedule the next campus session.' : 'The next published campus sessions will appear here.'}</p>{user?.role === 'admin' && !query && <Link className="button button-primary" to="/app/modules/manage">Schedule a module</Link>}</div>}
  </div>;
}




