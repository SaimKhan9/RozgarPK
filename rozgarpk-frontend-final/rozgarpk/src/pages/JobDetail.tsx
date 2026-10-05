import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES, mockJobs, mockWorkers } from '../data/mockData';
import type { Job } from '../types';

interface Props {
  showToast: (msg: string) => void;
}

const durationLabel: Record<string, string> = {
  '1day': '1 Day',
  '2-3days': '2–3 Days',
  '1week': '1 Week',
  '2weeks': '2 Weeks',
  '1month': '1 Month',
  '3months': '3 Months',
  '6months': '6 Months',
  'full-project': 'Full Project',
};

export default function JobDetail({ showToast }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const job = useMemo<Job | undefined>(() => mockJobs.find((item) => item.id === id), [id]);

  if (!job) {
    return (
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Job not found</h2>
          <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>The job posting you’re looking for is no longer available.</p>
          <button className="btn btn-primary" onClick={() => navigate('/browse')}>Browse Jobs</button>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find((item) => item.id === job.category);
  const relatedWorkers = mockWorkers.filter((worker) => worker.profile.category === job.category).slice(0, 3);

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 24px 64px' }}>
      <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ background: 'linear-gradient(135deg, var(--green), var(--green-light))', padding: 24, color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                <span className="badge badge-cat" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {category?.icon} {category?.label}
                </span>
                {job.isUrgent && <span className="badge badge-urgent">⚡ Urgent</span>}
              </div>
              <h1 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, letterSpacing: -1, margin: 0 }}>{job.title}</h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 26, fontWeight: 800 }}>Rs. {job.budget.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{job.paymentType} · {durationLabel[job.duration] || job.duration}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.9fr', gap: 22 }}>
            <div>
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Description</h3>
                <p style={{ color: 'var(--ink-mid)', lineHeight: 1.8, margin: 0 }}>{job.description}</p>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
                {[
                  `📍 ${job.area}, ${job.city}`,
                  `🕒 ${durationLabel[job.duration] || job.duration}`,
                  `👁 ${job.views} views`,
                  `📨 ${job.proposals} proposals`,
                ].map((chip) => (
                  <span key={chip} style={{ padding: '6px 12px', background: 'var(--green-pale)', color: 'var(--green)', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                    {chip}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-lg" onClick={() => showToast('✅ Proposal sent!')}>Apply Now</button>
                <button className="btn btn-ghost btn-lg" onClick={() => navigate('/browse')}>Back to Browse</button>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>Job Summary</h3>
              <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--ink-mid)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>Budget</span>
                  <strong style={{ color: 'var(--ink)' }}>Rs. {job.budget.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>Type</span>
                  <strong style={{ color: 'var(--ink)' }}>{job.paymentType}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>Category</span>
                  <strong style={{ color: 'var(--ink)' }}>{category?.label ?? job.category}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>Location</span>
                  <strong style={{ color: 'var(--ink)' }}>{job.city}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>Status</span>
                  <strong style={{ color: 'var(--green)' }}>{job.status}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 16 }}>Workers matching this category</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {relatedWorkers.map((worker) => (
            <div key={worker.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--green-pale)', display: 'grid', placeItems: 'center', fontSize: 22 }}>
                  {worker.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{worker.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{worker.profile.subCategory}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-mid)', marginBottom: 10 }}>
                ⭐ {worker.profile.rating} · {worker.profile.totalReviews} reviews
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-mid)', marginBottom: 14 }}>
                Rs. {worker.profile.ratePerDay.toLocaleString()}/day
              </div>
              <button className="btn btn-primary btn-sm btn-full" onClick={() => navigate(`/worker/${worker.id}`)}>
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
