import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/services';
import AdminNav from '../../components/AdminNav';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getUsers({
        role: roleFilter,
        search,
      });
      setUsers(res.data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleActive = async (user: any) => {
    const nextState = !user.is_active;
    const confirmMsg = nextState
      ? `Activate account for ${user.name}?`
      : `Deactivate/suspend account for ${user.name}?`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(user.id);
    try {
      await adminAPI.updateUserStatus(user.id, { isActive: nextState });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: nextState } : u))
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVerified = async (user: any) => {
    const nextState = !user.is_verified;
    setActionLoading(user.id);
    try {
      await adminAPI.updateUserStatus(user.id, { isVerified: nextState });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_verified: nextState } : u))
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update verification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!window.confirm(`⚠️ Permanently delete user "${user.name}" (${user.email})? This action cannot be undone.`)) {
      return;
    }
    setActionLoading(user.id);
    try {
      await adminAPI.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink)' }}>
            Users Management
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
            View, verify, activate/deactivate, and moderate all RozgarPK user accounts.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="btn btn-secondary btn-sm"
        >
          🔄 Refresh Users
        </button>
      </div>

      <AdminNav />

      {/* Filter and search bar */}
      <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, email, phone or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px', fontSize: 14 }}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>Filter Role:</span>
          <select
            className="form-input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '8px 12px', fontSize: 14, minWidth: 140 }}
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="worker">Workers Only</option>
            <option value="client">Clients Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, color: '#991B1B', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Users table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
            Loading users from database...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
            No users found matching your search.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead style={{ background: '#f5faf7', borderBottom: '1.5px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>User / Contact</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Role</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Location</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Verification</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Registered</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isBusy = actionLoading === u.id;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{u.email}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>📞 {u.phone}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 16,
                          fontSize: 12,
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          background: u.role === 'admin' ? '#FEF3C7' : u.role === 'worker' ? '#DCFCE7' : '#EFF6FF',
                          color: u.role === 'admin' ? '#B45309' : u.role === 'worker' ? '#15803D' : '#1D4ED8',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: 'var(--ink)' }}>{u.city || '—'}</div>
                        {u.area && <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{u.area}</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleToggleVerified(u)}
                          disabled={isBusy}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 16,
                            fontSize: 12,
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            background: u.is_verified ? '#DCFCE7' : '#F3F4F6',
                            color: u.is_verified ? '#15803D' : '#6B7280',
                          }}
                          title="Click to toggle verification status"
                        >
                          {u.is_verified ? '✅ Verified' : '⏳ Unverified'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 16,
                          fontSize: 12,
                          fontWeight: 600,
                          background: u.is_active ? '#ECFDF5' : '#FEF2F2',
                          color: u.is_active ? '#059669' : '#DC2626',
                        }}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--ink-soft)' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={isBusy}
                            className="btn btn-ghost btn-sm"
                            style={{
                              fontSize: 12,
                              padding: '4px 8px',
                              color: u.is_active ? '#DC2626' : '#166534',
                            }}
                          >
                            {u.is_active ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={isBusy}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: 12, padding: '4px 8px', color: '#DC2626' }}
                            title="Delete user"
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
