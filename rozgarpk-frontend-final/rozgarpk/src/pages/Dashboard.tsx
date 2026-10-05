import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI, proposalsAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';

interface Props { showToast: (msg: string) => void; }

const sideLinks = [
  { icon: '📊', label: 'Overview',  key: 'overview'   },
  { icon: '📋', label: 'My Jobs',   key: 'jobs'        },
  { icon: '📨', label: 'Proposals', key: 'proposals'   },
  { icon: '💬', label: 'Messages',  key: 'messages'    },
  { icon: '⭐', label: 'Reviews',   key: 'reviews'     },
  { icon: '⚙️', label: 'Settings',  key: 'settings'   },
];

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  open:        { bg: '#F0FDF4', color: '#166534', label: 'Open'       },
  'in-progress':{ bg: '#EFF6FF', color: '#1D4ED8', label: 'In Progress'},
  completed:   { bg: '#EEF2FF', color: '#4338CA', label: 'Completed'  },
  closed:      { bg: '#FEF2F2', color: '#991B1B', label: 'Closed'     },
};

export default function Dashboard({ showToast }: Props) {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [active, setActive] = useState('overview');
  const [jobs, setJobs] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', city: '', area: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || '',
      area: user.area || '',
    });
  }, [user]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsError('');

    if (profileForm.name.trim().length < 2) {
      setSettingsError('Name must be at least 2 characters.');
      return;
    }
    if (!/^03\d{9}$/.test(profileForm.phone.replace(/\D/g, ''))) {
      setSettingsError('Enter a valid Pakistani mobile number, for example 0300-1234567.');
      return;
    }
    if (!profileForm.city.trim()) {
      setSettingsError('City is required.');
      return;
    }

    setIsSavingSettings(true);
    try {
      await updateProfile({
        ...profileForm,
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        city: profileForm.city.trim(),
        area: profileForm.area.trim(),
        ...(profileForm.email.trim().toLowerCase() !== user?.email.toLowerCase() ? { currentPassword } : {}),
      });
      setCurrentPassword('');
      showToast('Profile settings saved.');
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setSettingsError(message || 'Could not save your changes. Please try again.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [jobsRes, proposalsRes] = await Promise.all([
          jobsAPI.getMy(),
          proposalsAPI.getMy(),
        ]);

        const myJobs = Array.isArray(jobsRes.data?.data)
          ? jobsRes.data.data
          : (jobsRes.data?.data?.jobs ?? []);

        const myProposals = Array.isArray(proposalsRes.data?.data)
          ? proposalsRes.data.data
          : (proposalsRes.data?.data?.proposals ?? []);

        setJobs(myJobs);
        setProposals(myProposals);
      } catch {
        setJobs([]);
        setProposals([]);
      }
    };

    loadDashboardData();
  }, []);

  const totalBudget = jobs.reduce((total, job) => total + Number(job.budget || 0), 0);
  const kpis = [
    { icon: '📋', num: String(jobs.length), label: 'Posted Jobs' },
    { icon: '📨', num: String(proposals.length), label: 'Proposals Received' },
    { icon: '✅', num: String(jobs.filter(job => job.status === 'completed' || job.status === 'in-progress').length), label: 'Active Jobs' },
    { icon: '💰', num: `Rs. ${totalBudget.toLocaleString()}`, label: 'Total Budget' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - var(--nav-height))' }}>
      {/* Sidebar */}
      <div style={{
        background: 'white', borderRight: '1.5px solid var(--border)',
        padding: '24px 0', position: 'sticky', top: 'var(--nav-height)',
        height: 'calc(100vh - var(--nav-height))', overflowY: 'auto',
      }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1.5px solid var(--border)', marginBottom: 8 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, marginBottom: 10,
            background: 'linear-gradient(135deg, var(--green), var(--green-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>👤</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{user?.name || 'Your Account'}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{user?.role === 'worker' ? 'Worker Account' : 'Client Account'}</div>
        </div>
        {sideLinks.map(link => (
          <button key={link.key} onClick={() => {
            setActive(link.key);
            if (link.key === 'messages') navigate('/chat');
          }} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 20px', width: '100%', textAlign: 'left',
            fontSize: 14, fontWeight: active === link.key ? 600 : 500,
            color: active === link.key ? 'var(--green)' : 'var(--ink-mid)',
            background: active === link.key ? 'var(--green-pale)' : 'transparent',
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            boxShadow: active === link.key ? 'inset 3px 0 var(--green)' : 'none',
          }}>
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{link.icon}</span>
            {link.label}
          </button>
        ))}
      </div>

      {/* Main */}
      <div style={{ padding: 32, background: 'var(--surface)', overflowY: 'auto' }}>
        {active === 'settings' ? (
          <div style={{ maxWidth: 760 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>Account Settings</h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 24 }}>Manage the contact and location details on your account.</p>
            <form className="card" onSubmit={saveProfile} style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 20 }}>Personal information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="settings-name">Full name</label>
                  <input id="settings-name" className="form-input" autoComplete="name" required minLength={2} value={profileForm.name} onChange={event => setProfileForm({ ...profileForm, name: event.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="settings-email">Email address</label>
                  <input id="settings-email" type="email" className="form-input" autoComplete="email" required value={profileForm.email} onChange={event => setProfileForm({ ...profileForm, email: event.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="settings-phone">Phone number</label>
                  <input id="settings-phone" type="tel" className="form-input" autoComplete="tel" required value={profileForm.phone} onChange={event => setProfileForm({ ...profileForm, phone: event.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="settings-city">City</label>
                  <input id="settings-city" className="form-input" autoComplete="address-level2" required value={profileForm.city} onChange={event => setProfileForm({ ...profileForm, city: event.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="settings-area">Area / neighborhood</label>
                <input id="settings-area" className="form-input" autoComplete="address-level3" value={profileForm.area} onChange={event => setProfileForm({ ...profileForm, area: event.target.value })} />
              </div>
              {profileForm.email.trim().toLowerCase() !== user?.email.toLowerCase() && (
                <div className="form-group">
                  <label className="form-label" htmlFor="settings-current-password">Current password</label>
                  <input id="settings-current-password" type="password" className="form-input" autoComplete="current-password" required value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} />
                </div>
              )}
              {settingsError && <div role="alert" style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', fontSize: 13 }}>{settingsError}</div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                <button className="btn btn-primary" type="submit" disabled={isSavingSettings} style={{ minWidth: 140, opacity: isSavingSettings ? 0.7 : 1 }}>{isSavingSettings ? 'Saving...' : 'Save changes'}</button>
              </div>
            </form>
          </div>
        ) : <>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.4, marginBottom: 20 }}>Dashboard</h2>

        {/* Worker — complete profile banner */}
        {user?.role === 'worker' && proposals.length === 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #166534, #15803D)',
            borderRadius: 12, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 18,
          }}>
            <div style={{ fontSize: 36 }}>👷</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 4 }}>
                Complete Your Worker Profile
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                Set up your skills, rates and location so clients can find and hire you directly.
              </div>
            </div>
            <a href="/worker/setup" style={{ whiteSpace: 'nowrap', padding: '10px 20px', borderRadius: 8, background: 'white', color: 'var(--green)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              Set Up Profile →
            </a>
          </div>
        )}

        {/* Client — post job shortcut */}
        {user?.role === 'client' && jobs.length === 0 && (
          <div style={{
            background: 'var(--green-pale)', border: '1.5px solid var(--green)', borderRadius: 12,
            padding: '18px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 18,
          }}>
            <div style={{ fontSize: 36 }}>📋</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)', marginBottom: 3 }}>Post Your First Job</div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                Describe what you need and receive proposals from verified workers in your city.
              </div>
            </div>
            <a href="/post-job" style={{ whiteSpace: 'nowrap', padding: '10px 20px', borderRadius: 8, background: 'var(--green)', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              Post a Job →
            </a>
          </div>
        )}

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
          {kpis.map((k, i) => (
            <div key={i} className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: ['var(--blue-pale)', 'var(--amber-light)', '#F0FDF4', 'var(--purple-pale)'][i],
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>{k.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.5 }}>{k.num}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500 }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Jobs Table */}
        <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Recent Jobs</h3>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/post-job')}>+ New Job</button>
          </div>
          {jobs.length === 0 ? (
            <div style={{ padding: '20px', color: 'var(--ink-soft)' }}>No jobs posted yet. Create your first job to get started.</div>
          ) : jobs.slice(0, 4).map(job => {
            const s = statusStyle[job.status];
            return (
              <div key={job.id} style={{
                padding: '14px 20px', borderBottom: '1.5px solid var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', transition: 'background 0.12s',
              }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                 onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{job.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>📍 {job.area}, {job.city} · {job.proposals} proposals</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: s.bg, color: s.color }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Proposals */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--border)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Latest Proposals</h3>
          </div>
          {proposals.length === 0 ? (
            <div style={{ padding: '20px', color: 'var(--ink-soft)' }}>No proposals received yet.</div>
          ) : proposals.slice(0, 4).map(p => (
            <div key={p.id} style={{
              padding: '14px 20px', borderBottom: '1.5px solid var(--surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'var(--green-pale)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>{p.workerAvatar}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                    {p.worker_name || p.workerName || 'Worker'} — Rs. {(p.quoted_price || p.quotedPrice || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    {'★'.repeat(Math.round(p.worker_rating || p.workerRating || 5))} ({p.worker_reviews || p.workerReviews || 0} reviews)
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm"
                  onClick={() => showToast('✅ Proposal accepted! Chat opened.')}>Accept</button>
                <button className="btn btn-ghost btn-sm"
                  onClick={() => showToast('❌ Proposal rejected.')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
        </>}
      </div>
    </div>
  );
}
