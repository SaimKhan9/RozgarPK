import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/services';
import AdminNav from '../../components/AdminNav';

const statusColors: Record<string, { bg: string; color: string }> = {
  open: { bg: '#F0FDF4', color: '#166534' },
  'in-progress': { bg: '#EFF6FF', color: '#1D4ED8' },
  completed: { bg: '#EEF2FF', color: '#4338CA' },
  closed: { bg: '#FEF2F2', color: '#991B1B' },
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getJobs({
        status: statusFilter,
        search,
      });
      setJobs(res.data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    setBusyId(jobId);
    try {
      await adminAPI.updateJobStatus(jobId, newStatus);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update job status');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteJob = async (job: any) => {
    if (!window.confirm(`⚠️ Permanently delete job "${job.title}" posted by ${job.client_name}?`)) {
      return;
    }
    setBusyId(job.id);
    try {
      await adminAPI.deleteJob(job.id);
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete job');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink)' }}>
            Jobs Management
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
            Moderate posted client jobs, update job statuses, and remove spam or inappropriate postings.
          </p>
        </div>
        <button
          onClick={fetchJobs}
          disabled={loading}
          className="btn btn-secondary btn-sm"
        >
          🔄 Refresh Jobs
        </button>
      </div>

      <AdminNav />

      {/* Filter and search */}
      <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by job title, client name, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px', fontSize: 14 }}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>Status:</span>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', fontSize: 14, minWidth: 150 }}
          >
            <option value="all">All Statuses ({jobs.length})</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, color: '#991B1B', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Jobs table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
            Loading posted jobs from database...
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
            No jobs found matching your criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead style={{ background: '#f5faf7', borderBottom: '1.5px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Job Details</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Client</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Budget</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Proposals</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const isBusy = busyId === job.id;
                  const currentStyle = statusColors[job.status] || { bg: '#F3F4F6', color: '#4B5563' };

                  return (
                    <tr key={job.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '12px 16px', maxWidth: 280 }}>
                        <Link
                          to={`/job/${job.id}`}
                          style={{ fontWeight: 700, color: 'var(--ink)', textDecoration: 'none' }}
                          title="Click to view job details"
                        >
                          {job.title}
                        </Link>
                        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                          📍 {job.area ? `${job.area}, ` : ''}{job.city || 'Pakistan'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>
                          Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{job.client_name || 'Client'}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{job.client_email}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 16,
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                        }}>
                          {job.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--green)' }}>
                        Rs. {Number(job.budget || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <select
                          value={job.status}
                          disabled={isBusy}
                          onChange={(e) => handleStatusChange(job.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 16,
                            fontSize: 12,
                            fontWeight: 700,
                            border: 'none',
                            background: currentStyle.bg,
                            color: currentStyle.color,
                            cursor: 'pointer',
                          }}
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        {job.proposals || 0} applied
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <Link
                            to={`/job/${job.id}`}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: 12, padding: '4px 8px', textDecoration: 'none' }}
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDeleteJob(job)}
                            disabled={isBusy}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: 12, padding: '4px 8px', color: '#DC2626' }}
                            title="Delete job"
                          >
                            🗑️
                          </button>
                        </div>
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
