import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jobsAPI, workersAPI, chatAPI } from '../api/services';
import { CATEGORIES } from '../data/mockData';
import JobCard from '../components/JobCard';
import WorkerCard from '../components/WorkerCard';

interface Props { showToast: (msg: string) => void; }

export default function Home({ showToast }: Props) {
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [featuredWorkers, setFeaturedWorkers] = useState<any[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [platformStats, setPlatformStats] = useState<{
    total_workers: number;
    completed_jobs: number;
    total_cities: number;
    avg_rating: number;
  }>({
    total_workers: 0,
    completed_jobs: 0,
    total_cities: 0,
    avg_rating: 5.0,
  });

  const startConversation = async (targetUserId: string, jobId?: string) => {
    try {
      const res = await chatAPI.startRoom({ targetUserId, jobId });
      navigate('/chat', { state: { roomId: res.data.data.id } });
    } catch {
      showToast('Please sign in with a client or worker account to start messaging.');
    }
  };

  useEffect(() => {
    const loadHighlights = async () => {
      try {
        const [jobsRes, workersRes, countsRes] = await Promise.all([
          jobsAPI.getAll({ limit: 3 }),
          workersAPI.getAll({ limit: 3 }),
          workersAPI.getCategoryCounts().catch(() => ({ data: { data: { categoryCounts: {}, stats: null } } })),
        ]);

        const jobs = Array.isArray(jobsRes.data?.data)
          ? jobsRes.data.data
          : (jobsRes.data?.data?.jobs ?? []);

        const workers = Array.isArray(workersRes.data?.data)
          ? workersRes.data.data
          : (workersRes.data?.data?.workers ?? []);

        setFeaturedJobs(jobs.slice(0, 3));
        setFeaturedWorkers(workers.slice(0, 3));

        if (countsRes.data?.data) {
          if (countsRes.data.data.categoryCounts) {
            setCategoryCounts(countsRes.data.data.categoryCounts);
          }
          if (countsRes.data.data.stats) {
            setPlatformStats(countsRes.data.data.stats);
          }
        }
      } catch {
        setFeaturedJobs([]);
        setFeaturedWorkers([]);
      }
    };

    loadHighlights();
  }, []);

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'var(--green)', padding: '72px 28px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -120, right: -80, width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 20, padding: '5px 14px', marginBottom: 24,
            fontSize: 13, color: 'rgba(255,255,255,0.85)',
          }}>
            <span style={{ width: 6, height: 6, background: '#4ade80', borderRadius: '50%' }} />
            Pakistan's #1 Local Jobs Platform
          </div>

          <h1 style={{
            fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, color: 'white',
            lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 16, maxWidth: 640,
          }}>
            Find Local Workers<br />
            <span style={{ color: 'var(--amber)' }}>or Hire Help Near You</span>
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 480, marginBottom: 32, lineHeight: 1.6 }}>
            Plumber, Electrician, Tutor, Mechanic — all in one place. Get work done today.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
            <button className="btn btn-lg" style={{ background: 'var(--amber)', color: 'white', border: 'none' }}
              onClick={() => navigate('/post-job')}>📋 Post a Job</button>
            <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
              onClick={() => navigate('/browse')}>👷 Find Workers</button>
          </div>

          {/* Search */}
          <div style={{
            background: 'white', borderRadius: 12, padding: 6,
            display: 'flex', alignItems: 'center', gap: 8,
            maxWidth: 560, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}>
            <span style={{ padding: '0 8px', fontSize: 18, color: 'var(--ink-soft)' }}>🔍</span>
            <input
              type="text"
              placeholder="Plumber, Tutor, Mechanic..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: 'var(--ink)', background: 'transparent' }}
            />
            <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
            <select style={{ border: 'none', outline: 'none', fontSize: 13, color: 'var(--ink-soft)', background: 'transparent', padding: '0 8px', cursor: 'pointer' }}>
              <option>📍 City</option>
              {['Islamabad','Karachi','Lahore','Rawalpindi','Peshawar'].map(c => <option key={c}>{c}</option>)}
            </select>
            <button
              className="btn btn-primary"
              style={{ borderRadius: 8, padding: '10px 20px' }}
              onClick={() => navigate('/browse')}
            >Search</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '20px 28px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 0, flexWrap: 'wrap' }}>
          {[
            { num: `${platformStats.total_workers > 0 ? platformStats.total_workers : 1}`, label: 'Registered Workers', icon: '👷' },
            { num: `${platformStats.completed_jobs}`, label: 'Jobs Completed', icon: '✅' },
            { num: `${platformStats.total_cities > 0 ? platformStats.total_cities : 1}`, label: 'Cities Covered', icon: '🏙️' },
            { num: `${platformStats.avg_rating || '5.0'} ⭐`, label: 'Average Rating', icon: '' },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 24px', borderRight: i < 3 ? '1px solid var(--border)' : 'none',
            }}>
              {stat.icon && <span style={{ fontSize: 22 }}>{stat.icon}</span>}
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.5 }}>{stat.num}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '44px 28px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>Categories</h2>
          <button className="btn btn-sm btn-ghost" onClick={() => navigate('/browse')}>View all →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {CATEGORIES.map(cat => {
            const count = categoryCounts[cat.id] || 0;
            return (
              <div key={cat.id} className="card" style={{ padding: '18px 14px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                onClick={() => navigate(cat.id === 'driver' ? '/driver' : cat.id === 'daily-labour' ? '/labour' : `/browse?category=${cat.id}`)}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{cat.label}</div>
                <div style={{
                  fontSize: 11,
                  color: count > 0 ? 'var(--green)' : 'var(--ink-soft)',
                  fontWeight: count > 0 ? 700 : 500
                }}>
                  {count === 1 ? '1 worker' : `${count.toLocaleString()} workers`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Jobs */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '44px 28px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>Latest Jobs</h2>
          <button className="btn btn-sm btn-ghost" onClick={() => navigate('/browse')}>View all →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {featuredJobs.length === 0 ? (
            <div className="card" style={{ padding: 20, color: 'var(--ink-soft)' }}>No jobs have been posted yet. Be the first to create one.</div>
          ) : featuredJobs.map(job => (
            <JobCard key={job.id} job={job} onApply={() => startConversation(job.clientId, job.id)} />
          ))}
        </div>
      </div>

      {/* Top Workers */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '44px 28px 52px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>Top Rated Workers</h2>
          <button className="btn btn-sm btn-ghost" onClick={() => navigate('/browse')}>View all →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {featuredWorkers.length === 0 ? (
            <div className="card" style={{ padding: 20, color: 'var(--ink-soft)' }}>No worker profiles are available yet.</div>
          ) : featuredWorkers.map(worker => (
            <WorkerCard key={worker.id} worker={worker} onHire={() => startConversation(worker.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
