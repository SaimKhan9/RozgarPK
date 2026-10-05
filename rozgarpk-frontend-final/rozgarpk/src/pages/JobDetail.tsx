import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI, workersAPI, chatAPI } from '../api/services';
import { CATEGORIES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import type { Job, Worker } from '../types';

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
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [relatedWorkers, setRelatedWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadJob = async () => {
      try {
        const res = await jobsAPI.getById(id);
        if (!isMounted) return;
        const data = res.data?.data;
        if (!data) {
          setError('Job posting not found.');
          return;
        }
        setJob(data);

        // Fetch workers matching this job's category
        try {
          const wRes = await workersAPI.getAll({ category: data.category, limit: 4 });
          if (isMounted) {
            const list = Array.isArray(wRes.data?.data)
              ? wRes.data.data
              : (wRes.data?.data?.workers ?? []);
            setRelatedWorkers(list.slice(0, 3));
          }
        } catch {
          if (isMounted) setRelatedWorkers([]);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || 'Could not load job details.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleApply = async () => {
    if (!job) return;

    if (!user) {
      showToast('Please login as a worker to apply for this job.');
      navigate('/login');
      return;
    }

    if (user.role === 'client') {
      showToast('You are logged in as a Client. Only Workers can apply for jobs.');
      return;
    }

    setIsApplying(true);
    try {
      const res = await chatAPI.startRoom({ targetUserId: job.clientId, jobId: job.id });
      const roomId = res.data?.data?.id;
      showToast('Message thread opened with the client!');
      navigate('/chat', { state: { roomId } });
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Could not start conversation with client.');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 820, margin: '60px auto', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Loading Job Details...</h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Please wait a moment.</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
            Job Not Found
          </h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            {error || 'The job posting you are looking for is no longer available.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/browse')}>
              Browse All Jobs
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find((item) => item.id === job.category);

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 24px 64px' }}>
      <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ background: 'linear-gradient(135deg, var(--green), var(--green-light))', padding: 24, color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                <span className="badge badge-cat" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {category?.icon} {category?.label || job.category}
                </span>
                {job.isUrgent && <span className="badge badge-urgent">⚡ Urgent</span>}
                <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 8 }}>
                  Status: {job.status}
                </span>
              </div>
              <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>
                {job.title}
              </h1>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>
                Posted by {job.clientName || 'Client'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>Rs. {Number(job.budget || 0).toLocaleString()}</div>
              {job.budgetMax && (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                  Up to Rs. {Number(job.budgetMax).toLocaleString()}
                </div>
              )}
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                {job.paymentType} · {durationLabel[job.duration] || job.duration}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {job.imageUrl && (
            <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', maxHeight: 340 }}>
              <img src={job.imageUrl} alt={job.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.9fr', gap: 24 }}>
            <div>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Description</h3>
                <p style={{ color: 'var(--ink-mid)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>
                  {job.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                {[
                  `📍 ${job.area ? `${job.area}, ` : ''}${job.city}`,
                  `🕒 ${durationLabel[job.duration] || job.duration}`,
                  `👁 ${job.views || 0} views`,
                  `📨 ${job.proposals || 0} proposals`,
                ].map((chip) => (
                  <span key={chip} style={{ padding: '6px 12px', background: 'var(--green-pale)', color: 'var(--green)', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                    {chip}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleApply}
                  disabled={isApplying}
                >
                  {isApplying ? 'Opening Chat...' : '💬 Message Client & Apply'}
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => navigate('/browse')}>
                  Back to Browse
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, alignSelf: 'start' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>Job Summary</h3>
              <div style={{ display: 'grid', gap: 12, fontSize: 14, color: 'var(--ink-mid)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>Budget</span>
                  <strong style={{ color: 'var(--ink)' }}>Rs. {Number(job.budget || 0).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>Payment Type</span>
                  <strong style={{ color: 'var(--ink)' }}>{job.paymentType}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>Category</span>
                  <strong style={{ color: 'var(--ink)' }}>{category?.label ?? job.category}</strong>
                </div>
                {job.subCategory && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span>Specialization</span>
                    <strong style={{ color: 'var(--ink)' }}>{job.subCategory}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>Location</span>
                  <strong style={{ color: 'var(--ink)' }}>{job.city}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>Status</span>
                  <strong style={{ color: 'var(--green)', textTransform: 'capitalize' }}>{job.status}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedWorkers.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 16 }}>
            Top Workers for this Category
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {relatedWorkers.map((worker) => {
              const p = worker.profile || ({} as any);
              return (
                <div key={worker.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: 'var(--green-pale)',
                      display: 'grid', placeItems: 'center', fontSize: 20, overflow: 'hidden'
                    }}>
                      {worker.avatar && (worker.avatar.startsWith('http') || worker.avatar.startsWith('data:')) ? (
                        <img src={worker.avatar} alt={worker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        worker.avatar || worker.name?.charAt(0).toUpperCase() || '👷'
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{worker.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{p.subCategory || p.category || 'Worker'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-mid)', marginBottom: 8 }}>
                    ⭐ {Number(p.rating || 5).toFixed(1)} · {p.totalReviews || 0} reviews
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 700, marginBottom: 14 }}>
                    Rs. {Number(p.ratePerDay || 0).toLocaleString()}/day
                  </div>
                  <button className="btn btn-primary btn-sm btn-full" onClick={() => navigate(`/worker/${worker.id}`)}>
                    View Profile
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
