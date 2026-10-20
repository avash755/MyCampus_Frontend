import Icon from './Icon';

export default function MetricCard({ label, value, helper, icon, tone = 'lavender' }) {
  return (
    <article className="metric-card">
      <div className={'metric-icon metric-icon-' + tone}><Icon name={icon} size={18} /></div>
      <div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{helper}</small></div>
      <span className="metric-trend">↗</span>
    </article>
  );
}