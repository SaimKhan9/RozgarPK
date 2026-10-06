import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/services';
import AdminNav from '../../components/AdminNav';

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getAnalytics();
      setData(res.data?.data || null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const jobsByCategory: Array<{ category: string; count: number }> = data?.jobsByCategory || [];
  const workersByCategory: Array<{ category: string; count: number }> = data?.workersByCategory || [];
  const topCities: Array<{ city: string; count: number }> = data?.topCities || [];
  const jobsByDay: Array<{ day: string; count: number }> = data?.jobsByDay || [];
  const usersGrowth: Array<{ day: string; count: number }> = data?.usersGrowth || [];

  const maxJobsDay = Math.max(...jobsByDay.map((d) => Number(d.count)), 1);
  const maxUsersDay = Math.max(...usersGrowth.map((d) => Number(d.count)), 1);

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink)' }}>
            Analytics & Platform Insights
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
            Detailed breakdown of job volume, marketplace categories, and regional distribution.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="btn btn-secondary btn-sm"
        >
          🔄 Refresh Analytics
        </button>
      </div>

      <AdminNav />

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, color: '#991B1B', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-soft)' }}>
          Computing platform analytics...
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Charts Row 1: Daily Job Posting & User Registrations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
            {/* Jobs per day */}
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>
                📅 Jobs Activity (Last 30 Days)
              </h3>
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 18 }}>
                Number of job postings recorded in the database
              </p>
              {jobsByDay.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-soft)', background: 'var(--surface)', borderRadius: 10 }}>
                  No recent job posting events in this timeframe.
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, paddingBottom: 8, overflowX: 'auto' }}>
                  {jobsByDay.map((item) => {
                    const heightPct = Math.max(Math.round((Number(item.count) / maxJobsDay) * 100), 12);
                    return (
                      <div key={item.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 32, flex: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>
                          {item.count}
                        </span>
                        <div style={{
                          width: '100%',
                          height: `${heightPct}%`,
                          background: 'linear-gradient(180deg, var(--green), #2E8B57)',
                          borderRadius: '4px 4px 0 0',
                          minHeight: 16,
                        }} />
                        <span style={{ fontSize: 10, color: 'var(--ink-soft)', marginTop: 4, whiteSpace: 'nowrap' }}>
                          {item.day.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User growth */}
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>
                👥 User Registrations (Last 30 Days)
              </h3>
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 18 }}>
                New accounts created per day across all roles
              </p>
              {usersGrowth.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-soft)', background: 'var(--surface)', borderRadius: 10 }}>
                  No new user registrations in this timeframe.
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, paddingBottom: 8, overflowX: 'auto' }}>
                  {usersGrowth.map((item) => {
                    const heightPct = Math.max(Math.round((Number(item.count) / maxUsersDay) * 100), 12);
                    return (
                      <div key={item.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 32, flex: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#2563EB', marginBottom: 4 }}>
                          {item.count}
                        </span>
                        <div style={{
                          width: '100%',
                          height: `${heightPct}%`,
                          background: 'linear-gradient(180deg, #3B82F6, #1D4ED8)',
                          borderRadius: '4px 4px 0 0',
                          minHeight: 16,
                        }} />
                        <span style={{ fontSize: 10, color: 'var(--ink-soft)', marginTop: 4, whiteSpace: 'nowrap' }}>
                          {item.day.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Category breakdown & Regional distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {/* Jobs by Category */}
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--ink)' }}>
                📋 Demand by Job Category
              </h3>
              {jobsByCategory.length === 0 ? (
                <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>No jobs categorized yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {jobsByCategory.map((c) => (
                    <div key={c.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        <span style={{ textTransform: 'capitalize' }}>{c.category.replace('-', ' ')}</span>
                        <span>{c.count} jobs</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--surface)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(c.count * 20, 100)}%`, height: '100%', background: '#F59E0B', borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Workers by Category */}
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--ink)' }}>
                👷 Worker Supply by Category
              </h3>
              {workersByCategory.length === 0 ? (
                <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>No workers registered yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {workersByCategory.map((c) => (
                    <div key={c.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        <span style={{ textTransform: 'capitalize' }}>{c.category.replace('-', ' ')}</span>
                        <span>{c.count} workers</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--surface)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(c.count * 25, 100)}%`, height: '100%', background: 'var(--green)', borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Regional breakdown */}
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--ink)' }}>
                📍 Regional Market Share
              </h3>
              {topCities.length === 0 ? (
                <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>No city data available yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {topCities.map((item) => (
                    <div key={item.city}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        <span>{item.city}</span>
                        <span>{item.count} users</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--surface)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(item.count * 20, 100)}%`, height: '100%', background: '#8B5CF6', borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
