import { useEffect, useState } from 'react';

const duration = (milliseconds) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60
  };
};

export default function ModuleCountdown({ startsAt, durationDays = 1, compact = false }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!startsAt) return <div className={'module-countdown ' + (compact ? 'module-countdown-compact' : '')}><span>Schedule coming soon</span></div>;
  const start = new Date(startsAt).getTime();
  if (!Number.isFinite(start)) return null;
  const end = start + Math.max(1, Number(durationDays) || 1) * 86400000;
  const target = now < start ? start : end;
  const label = now < start ? 'Starts in' : now < end ? 'Ends in' : 'Completed';
  if (now >= end) return <div className={'module-countdown module-countdown-done ' + (compact ? 'module-countdown-compact' : '')}><span>Module completed</span></div>;
  const time = duration(target - now);
  return (
    <div className={'module-countdown ' + (compact ? 'module-countdown-compact' : '')} aria-label={label + ' ' + time.days + ' days'}>
      <span className="countdown-label">{label}</span>
      <strong>{String(time.days).padStart(2, '0')}<small>d</small> {String(time.hours).padStart(2, '0')}<small>h</small> {String(time.minutes).padStart(2, '0')}<small>m</small> {String(time.seconds).padStart(2, '0')}<small>s</small></strong>
    </div>
  );
}
