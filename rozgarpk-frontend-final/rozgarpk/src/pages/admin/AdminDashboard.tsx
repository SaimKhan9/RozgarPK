import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/services';
import AdminNav from '../../components/AdminNav';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getStats();
      setStats(res.data?.data || null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const users = stats?.users || {};
  const jobs = stats?.jobs || {};
  const proposals = stats?.proposals || {};
  const reviews = stats?.reviews || {};
  const topCities: Array<{ city: string; count: number }> = stats?.topCities || [];
  const topCategories: Array<{ category: string; count: number }> = stats?.topCategories || [];

  const totalUsersCount = Number(users.total_users || 0);

  const kpis = [
    { label: 'Total Registered Users', value: totalUsersCount, sub: `${users.active_users || 0} active`, accent: '#1B6B3A', icon: '👥' },
    { label: 'Workers Registered', value: Number(users.workers || 0), sub: `${users.verified_users || 0} verified`, accent: '#2E8B57', icon: '👷' },
    { label: 'Clients Registered', value: Number(users.clients || 0), sub: 'Active clients', accent: '#E8820C', icon: '💼' },
    { label: 'Total Jobs Posted', value: Number(jobs.total_jobs || 0), sub: `${jobs.open_jobs || 0} currently open`, accent: '#2563EB', icon: '📋' },
    { label: 'Proposals Submitted', value: Number(proposals.total_proposals || 0), sub: `${proposals.accepted_proposals || 0} accepted`, accent: '#7C3AED', icon: '📨' },
    { label: 'Total Jobs Budget', value: `Rs. ${Number(jobs.total_budget || 0).toLocaleString()}`, sub: 'Platform volume', accent: '#059669', icon: '💰' },
    { label: 'Average Review Rating', value: `${reviews.avg_rating || '5.0'} ★`, sub: `${reviews.total_reviews || 0} total reviews`, accent: '#D97706', icon: '⭐' },
    { label: 'Platform Messages', value: Number(stats?.messages?.total_messages || 0), sub: 'Live chat messages', accent: '#DC2626', icon: '💬' },
  ];

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink)' }}>
            Admin Control Center
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
            Real-time platform overview and database monitoring for RozgarPK.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          🔄 {loading ? 'Refreshing...' : 'Refresh Live Data'}
        </button>
      </div>

      <AdminNav />

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, color: '#991B1B', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {loading && !stats ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-soft)' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
          Loading real-time database statistics...
        </div>
      ) : (
        <>
          {/* KPI grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 28 }}>
            {kpis.map((kpi) => (
              <div key={kpi.label} className="card" style={{ padding: 18, borderLeft: `4px solid ${kpi.accent}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 600 }}>
                    {kpi.label}
                  </div>
                  <span style={{ fontSize: 18 }}>{kpi.icon}</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: kpi.accent, marginTop: 8 }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                  {kpi.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28 }}>
            {/* Top Cities */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>📍 Top Cities by Users</h3>
                <Link to="/admin/users" style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
                  View Users →
                </Link>
              </div>
              {topCities.length === 0 ? (
                <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>No city data yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {topCities.map((item) => {
                    const pct = totalUsersCount > 0 ? Math.round((Number(item.count) / totalUsersCount) * 100) : 0;
                    return (
                      <div key={item.city}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                          <span>{item.city}</span>
                          <span style={{ color: 'var(--ink-soft)' }}>{item.count} users ({pct}%)</span>
                        </div>
                        <div style={{ height: 8, background: '#E8F5EE', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.max(pct, 5)}%`, height: '100%', background: 'var(--green)', borderRadius: 999 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Categories */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>👷 Workers by Category</h3>
                <Link to="/admin/workers" style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
                  Manage Workers →
                </Link>
              </div>
              {topCategories.length === 0 ? (
                <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>No worker profiles registered yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {topCategories.map((cat) => (
                    <div key={cat.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--surface)', borderRadius: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
                        {cat.category.replace('-', ' ')}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: 'var(--green-pale)', color: 'var(--green)' }}>
                        {cat.count} workers
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--ink)' }}>
              ⚡ Quick Actions & Moderation
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link to="/admin/users" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                👥 Manage All Users & Accounts
              </Link>
              <Link to="/admin/workers" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                🛡️ Verify Worker Profiles
              </Link>
              <Link to="/admin/jobs" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                📋 Moderate Posted Jobs
              </Link>
              <Link to="/admin/analytics" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                📈 View Growth & Trend Analytics
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
