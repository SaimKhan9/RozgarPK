import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, CITIES } from '../data/mockData';
import { workersAPI, jobsAPI, chatAPI } from '../api/services';
import WorkerCard from '../components/WorkerCard';
import JobCard from '../components/JobCard';
import type { Worker, Job } from '../types';

interface Props { showToast: (msg: string) => void; }

export default function Browse({ showToast }: Props) {
  const navigate = useNavigate();
  const [tab, setTab]       = useState<'workers' | 'jobs'>('workers');
  const [search, setSearch] = useState('');
  const [city, setCity]     = useState('');
  const [cat, setCat]       = useState('');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch from real API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (tab === 'workers') {
          const res = await workersAPI.getAll({ category: cat || undefined, city: city || undefined, search: search || undefined });
          const list = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.workers ?? []);
          setWorkers(list);
        } else {
          const res = await jobsAPI.getAll({ category: cat || undefined, city: city || undefined, search: search || undefined });
          const list = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.jobs ?? []);
          setJobs(list);
        }
      } catch {
        setWorkers([]);
        setJobs([]);
      } finally { setIsLoading(false); }
    };
    const timer = setTimeout(fetchData, 400);
    return () => clearTimeout(timer);
  }, [tab, search, city, cat]);

  // Local filter fallback (when using mock data)
  const filteredWorkers = workers.filter(w =>
    (!search || w.name.toLowerCase().includes(search.toLowerCase()) || w.profile?.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))) &&
    (!city || w.city === city) &&
    (!cat || w.profile?.category === cat)
  );
  const filteredJobs = jobs.filter(j =>
    (!search || j.title.toLowerCase().includes(search.toLowerCase())) &&
    (!city || j.city === city) &&
    (!cat || j.category === cat)
  );

  const startConversation = async (targetUserId: string, jobId?: string) => {
    try {
      const res = await chatAPI.startRoom({ targetUserId, jobId });
      navigate('/chat', { state: { roomId: res.data.data.id } });
    } catch {
      showToast('Please sign in with a client or worker account to start messaging.');
    }
  };

  return (
    <div>
      <div style={{ background: 'var(--green)', padding: '28px 28px 0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: -0.5, marginBottom: 20 }}>Find Work & Workers</h2>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['workers', 'jobs'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 22px', borderRadius: '8px 8px 0 0', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', background: tab === t ? 'var(--surface)' : 'rgba(255,255,255,0.1)', color: tab === t ? 'var(--ink)' : 'rgba(255,255,255,0.7)' }}>
                {t === 'workers' ? '👷 Workers' : '📋 Jobs'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 28px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by skill or name..." className="form-input" style={{ paddingLeft: 36 }} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={city} onChange={e => setCity(e.target.value)}>
            <option value="">📍 All Cities</option>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }}>
            <option>⭐ All Ratings</option><option>4.5+ Stars</option><option>4+ Stars</option>
          </select>
          <select className="form-select" style={{ width: 'auto' }}>
            <option>💰 Budget</option><option>Rs. 0–2,000</option><option>Rs. 2–5,000</option><option>Rs. 5,000+</option>
          </select>
        </div>

        <div className="toggle-group" style={{ marginBottom: 24 }}>
          <button className={`toggle-pill ${!cat ? 'active' : ''}`} onClick={() => setCat('')}>All</button>
          {CATEGORIES.map(c => (
            <button key={c.id} className={`toggle-pill ${cat === c.id ? 'active' : ''}`} onClick={() => setCat(c.id)}>
              {c.icon} {c.label.split(' ')[0]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-soft)' }}>⏳ Loading...</div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20 }}>
              {tab === 'workers' ? filteredWorkers.length : filteredJobs.length} results
            </p>
            {tab === 'workers' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {filteredWorkers.map((w, i) => <WorkerCard key={w.id || i} worker={w} onHire={() => startConversation(w.id)} />)}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {filteredJobs.map((j, i) => <JobCard key={j.id || i} job={j} onApply={() => startConversation(j.clientId, j.id)} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
