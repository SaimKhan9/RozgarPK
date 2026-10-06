import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/services';
import AdminNav from '../../components/AdminNav';
import { CATEGORIES } from '../../data/mockData';

export default function AdminWorkers() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchWorkers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getWorkers({
        category: categoryFilter,
        search,
      });
      setWorkers(res.data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWorkers();
  };

  const handleToggleVerify = async (worker: any) => {
    const nextState = !worker.profile_verified;
    setTogglingId(worker.id);
    try {
      await adminAPI.toggleWorkerVerification(worker.id, nextState);
      setWorkers((prev) =>
        prev.map((w) =>
          w.id === worker.id ? { ...w, profile_verified: nextState, user_verified: nextState } : w
        )
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update verification status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink)' }}>
            Workers Management
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
            Manage registered worker profiles, verify credentials, and review worker details.
          </p>
        </div>
        <button
          onClick={fetchWorkers}
          disabled={loading}
          className="btn btn-secondary btn-sm"
        >
          🔄 Refresh Workers
        </button>
      </div>

      <AdminNav />

      {/* Filter and search */}
      <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by worker name, city, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px', fontSize: 14 }}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>Category:</span>
          <select
            className="form-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '8px 12px', fontSize: 14, minWidth: 160 }}
          >
            <option value="all">All Categories ({workers.length})</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, color: '#991B1B', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Workers table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
            Loading worker profiles from database...
          </div>
        ) : workers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
            No registered worker profiles found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead style={{ background: '#f5faf7', borderBottom: '1.5px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Worker Profile</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Location</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Rate / Day</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Rating & Jobs</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Verification</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => {
                  const isBusy = togglingId === w.id;
                  const categoryName = CATEGORIES.find((c) => c.id === w.category)?.label || w.category;

                  return (
                    <tr key={w.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{w.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{w.email}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>📞 {w.phone}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 16,
                          fontSize: 12,
                          fontWeight: 600,
                          background: 'var(--green-pale)',
                          color: 'var(--green)',
                        }}>
                          {categoryName}
                        </span>
                        {w.experience ? (
                          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>
                            {w.experience} yrs exp
                          </div>
                        ) : null}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{w.city || '—'}</div>
                        {w.area && <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{w.area}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--green)' }}>
                        {w.rate_per_day ? `Rs. ${Number(w.rate_per_day).toLocaleString()}` : 'Negotiable'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#D97706' }}>
                          ★ {w.rating || '5.0'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                          {w.total_jobs_done || 0} jobs done
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleToggleVerify(w)}
                          disabled={isBusy}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 16,
                            fontSize: 12,
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            background: w.profile_verified ? '#DCFCE7' : '#FEF3C7',
                            color: w.profile_verified ? '#15803D' : '#B45309',
                          }}
                          title="Click to toggle worker verification"
                        >
                          {w.profile_verified ? '🛡️ Verified' : '⏳ Pending'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <Link
                          to={`/worker/${w.user_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 12, padding: '4px 8px', textDecoration: 'none' }}
                        >
                          View Profile ↗
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
