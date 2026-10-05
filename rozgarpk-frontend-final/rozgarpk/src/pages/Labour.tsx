import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workersAPI, chatAPI } from '../api/services';

interface Props { showToast: (msg: string) => void; }

const workTypes  = [
  { icon: '🧱', title: 'Mason',          sub: 'Brick & block work'   },
  { icon: '🏗️', title: 'Helper / Labour', sub: 'General labour work'  },
  { icon: '🪣', title: 'Plaster Worker', sub: 'Wall plastering'       },
  { icon: '🪟', title: 'Tile Worker',    sub: 'Floor & wall tiles'    },
  { icon: '🏛️', title: 'Roof Slab',      sub: 'Roof casting'          },
  { icon: '⛏️', title: 'Excavation',     sub: 'Foundation digging'    },
];
const workerCounts = ['1 Worker','2 Workers','3–5 Workers','5–10 Workers','10+ Workers'];
const durations    = ['1 Day','2–3 Days','1 Week','2 Weeks','1 Month','Full Project'];
const payments     = ['💰 Per Worker / Day','📦 Full Contract','📅 Weekly'];
const materials    = ['🏠 I (Client) Will Provide','👷 Worker Will Bring','🤝 We Share'];

const rateRows = [
  { type: '🧱 Mason (Brick)',   skilled: 'Rs. 2,000–2,500', helper: 'Rs. 1,200–1,500', note: 'Materials separate'   },
  { type: '🪣 Plaster Worker',  skilled: 'Rs. 2,500–3,000', helper: 'Rs. 1,200–1,500', note: '1 room per day'       },
  { type: '🪟 Tile Worker',     skilled: 'Rs. 3,000–4,000', helper: 'Rs. 1,500',        note: 'Client supplies tiles'},
  { type: '🏛️ Roof Slab',       skilled: 'Rs. 2,500',       helper: 'Rs. 1,500',        note: 'Team required'       },
  { type: '⛏️ Excavation',      skilled: '—',               helper: 'Rs. 1,000–1,500',  note: 'Also per cubic ft'   },
  { type: '🏗️ General Labour',  skilled: '—',               helper: 'Rs. 1,000–1,200',  note: 'Any general work'    },
];

export default function Labour({ showToast }: Props) {
  const navigate = useNavigate();
  const [workType,    setWorkType]    = useState('Mason');
  const [workerCount, setWorkerCount] = useState('1 Worker');
  const [duration,    setDuration]    = useState('1 Day');
  const [payment,     setPayment]     = useState('💰 Per Worker / Day');
  const [material,    setMaterial]    = useState('🏠 I (Client) Will Provide');
  const [workers,     setWorkers]     = useState<any[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);

  const startConversation = async (targetUserId: string) => {
    try {
      const res = await chatAPI.startRoom({ targetUserId });
      navigate('/chat', { state: { roomId: res.data?.data?.id } });
    } catch {
      showToast('Please sign in to message this worker.');
    }
  };

  useEffect(() => {
    const loadLabourWorkers = async () => {
      setIsLoading(true);
      try {
        const res = await workersAPI.getAll({ category: 'daily-labour' });
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : (res.data?.data?.workers ?? []);
        setWorkers(list);
      } catch {
        setWorkers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLabourWorkers();
  }, []);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#3d1f00,#7a3e00)',
        borderRadius: 14, padding: 28, marginBottom: 24, color: 'white',
      }}>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>👷 Daily Labour & Construction</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Hire Construction Workers for Your Home or Project</div>
        <div style={{ fontSize: 14, opacity: 0.8 }}>Mason, Helper, Plaster, Tiles, Roof Slab — everything covered. From 1 day to full project.</div>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        {/* Work Type */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
          Select Type of Work
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, marginBottom: 20 }}>
          {workTypes.map(w => (
            <div key={w.title} onClick={() => setWorkType(w.title)} style={{
              border: `2px solid ${workType === w.title ? 'var(--green)' : 'var(--border)'}`,
              background: workType === w.title ? 'var(--green-pale)' : 'white',
              borderRadius: 10, padding: 14, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{w.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{w.title}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{w.sub}</div>
            </div>
          ))}
        </div>

        {/* Workers Count */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 10 }}>How Many Workers Needed?</p>
        <div className="toggle-group" style={{ marginBottom: 18 }}>
          {workerCounts.map(c => (
            <button key={c} className={`toggle-pill ${workerCount === c ? 'active' : ''}`} onClick={() => setWorkerCount(c)}>{c}</button>
          ))}
        </div>

        {/* Duration */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 10 }}>How Many Days of Work?</p>
        <div className="toggle-group" style={{ marginBottom: 18 }}>
          {durations.map(d => (
            <button key={d} className={`toggle-pill ${duration === d ? 'active' : ''}`} onClick={() => setDuration(d)}>{d}</button>
          ))}
        </div>

        {/* Payment */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 10 }}>Payment Method</p>
        <div className="toggle-group" style={{ marginBottom: 18 }}>
          {payments.map(p => (
            <button key={p} className={`toggle-pill ${payment === p ? 'active' : ''}`} onClick={() => setPayment(p)}>{p}</button>
          ))}
        </div>

        {/* Material */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 10 }}>Who Provides Materials?</p>
        <div className="toggle-group" style={{ marginBottom: 24 }}>
          {materials.map(m => (
            <button key={m} className={`toggle-pill ${material === m ? 'active' : ''}`} onClick={() => setMaterial(m)}>{m}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn btn-primary btn-full btn-lg"
            style={{ flex: 2 }}
            onClick={() => navigate('/post-job?category=daily-labour')}
          >
            👷 Post Construction Job
          </button>
          <button
            className="btn btn-ghost btn-lg"
            style={{ flex: 1 }}
            onClick={() => navigate('/browse?category=daily-labour')}
          >
            Browse Workers
          </button>
        </div>
      </div>

      {/* Rate Guide */}
      <div className="card" style={{ padding: 22, marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>
          📊 Market Rate Guide (Reference Rates)
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface)' }}>
                {['Work Type','Per Day (Skilled)','Per Day (Helper)','Note'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--ink-soft)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rateRows.map(row => (
                <tr key={row.type} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{row.type}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--green)' }}>{row.skilled}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--ink-mid)' }}>{row.helper}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--ink-soft)' }}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Workers */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>
        Available Construction Workers ({workers.length})
      </h3>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-soft)' }}>
          ⏳ Loading workers...
        </div>
      ) : workers.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>
          <p style={{ marginBottom: 12 }}>No daily labour workers registered in this category yet.</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/post-job?category=daily-labour')}>
            Post a Construction Job
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {workers.map((w, i) => {
            const profile = w.profile || {};
            return (
              <div
                key={w.id || i}
                className="card"
                style={{ padding: 20, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onClick={() => navigate(`/worker/${w.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                      background: 'linear-gradient(135deg,var(--green),var(--green-light))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                      overflow: 'hidden', color: 'white', fontWeight: 800
                    }}>
                      {w.avatar && (w.avatar.startsWith('http') || w.avatar.startsWith('data:')) ? (
                        <img src={w.avatar} alt={w.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        w.avatar || w.name?.charAt(0).toUpperCase() || '👷'
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{w.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>{profile.subCategory || 'Construction Worker'}</div>
                      <div className="stars">
                        {'★'.repeat(Math.round(profile.rating || 5))}
                        <span style={{ fontSize: 11, color: 'var(--ink-soft)', marginLeft: 4 }}>({profile.totalReviews || 0})</span>
                      </div>
                    </div>
                  </div>
                  {profile.isVerified && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'var(--green-pale)', color: 'var(--green)', whiteSpace: 'nowrap' }}>
                      ✓ Verified
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {(profile.skills || []).slice(0, 4).map((t: string) => (
                    <span key={t} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink-mid)' }}>{t}</span>
                  ))}
                </div>

                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 10 }}>
                  📍 {w.area ? `${w.area}, ` : ''}{w.city || 'Pakistan'} {profile.experience ? `· ${profile.experience} yrs` : ''}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1.5px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>
                      Rs. {Number(profile.ratePerDay || 0).toLocaleString()}/day
                    </div>
                    {profile.ratePerHour && (
                      <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Rs. {profile.ratePerHour}/hour</div>
                    )}
                  </div>
                  <button
                    className="btn btn-amber btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      startConversation(w.id);
                    }}
                  >
                    Contact
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
