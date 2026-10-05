import { useNavigate } from 'react-router-dom';
import type { Job } from '../types';
import { CATEGORIES } from '../data/mockData';

interface Props {
  job: Job;
  onApply?: () => void;
}

const durationLabel: Record<string, string> = {
  '1day': '1 Day', '2-3days': '2–3 Days', '1week': '1 Week',
  '2weeks': '2 Weeks', '1month': '1 Month', '3months': '3 Months',
  '6months': '6 Months', 'full-project': 'Full Project',
};

const formatPostedAt = (createdAt: string) => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';

  const localDateTime = new Intl.DateTimeFormat(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  }).format(date);
  return `Posted ${localDateTime}`;
};

export default function JobCard({ job, onApply }: Props) {
  const navigate = useNavigate();
  const cat = CATEGORIES.find(c => c.id === job.category);

  return (
    <div
      className="card"
      style={{ padding: 20, cursor: 'pointer' }}
      onClick={() => navigate(`/job/${job.id}`)}
    >
      {/* Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span className="badge badge-cat">{cat?.icon} {cat?.label}</span>
        {job.isUrgent && <span className="badge badge-urgent">⚡ Urgent</span>}
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 6, lineHeight: 1.3 }}>{job.title}</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.55, marginBottom: 12 }}>{job.description}</p>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: 'var(--ink-mid)' }}>📍 {job.area}, {job.city}</span>
        <span style={{ fontSize: 12, color: 'var(--ink-mid)' }}>
          {job.paymentType === 'monthly' ? '📅' : '⏱'} {durationLabel[job.duration]}
        </span>
        <span style={{ fontSize: 12, color: 'var(--ink-mid)' }}>👁 {job.views} views</span>
        <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>🗓 {formatPostedAt(job.createdAt)}</span>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTop: '1.5px solid var(--border)',
      }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>
          Rs. {job.budget.toLocaleString()}
          {job.budgetMax && ` – ${job.budgetMax.toLocaleString()}`}
          {job.paymentType === 'monthly' && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-soft)' }}>/mo</span>}
          {job.paymentType === 'per-day' && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-soft)' }}>/day</span>}
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={e => { e.stopPropagation(); onApply?.(); }}
        >Message Client</button>
      </div>
    </div>
  );
}
