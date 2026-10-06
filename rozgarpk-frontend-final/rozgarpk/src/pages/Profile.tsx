import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 64, maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink)' }}>
          Account Profile
        </h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
          Manage your personal details, credentials, and marketplace roles.
        </p>
      </div>

      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
          <div style={{
            width: 100,
            height: 100,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
            display: 'grid',
            placeItems: 'center',
            color: 'white',
            fontSize: 40,
            fontWeight: 800,
            boxShadow: '0 4px 12px rgba(27, 107, 58, 0.25)',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                {user?.name}
              </h2>
              <span style={{
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'capitalize',
                background: user?.role === 'admin' ? '#FEF3C7' : user?.role === 'worker' ? '#DCFCE7' : '#EFF6FF',
                color: user?.role === 'admin' ? '#B45309' : user?.role === 'worker' ? '#15803D' : '#1D4ED8',
              }}>
                {user?.role} Account
              </span>
              {user?.isVerified && (
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>
                  ✅ Verified
                </span>
              )}
            </div>

            <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 16px 0' }}>
              📍 {user?.area ? `${user?.area}, ` : ''}{user?.city || 'Pakistan'}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Link to="/dashboard" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                ⚙️ Account Settings
              </Link>
              {user?.role === 'worker' && (
                <>
                  <Link to="/worker/setup" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                    🛠️ Edit Worker Profile
                  </Link>
                  {user?.id && (
                    <Link to={`/worker/${user.id}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                      👁️ View Public Profile
                    </Link>
                  )}
                </>
              )}
              {user?.role === 'client' && (
                <Link to="/post-job" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                  + Post a Job
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D' }}>
                  🛡️ Admin Control Panel
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 6 }}>
            Email Address
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
            {user?.email}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 6 }}>
            Phone Number
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
            {user?.phone || 'Not provided'}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 6 }}>
            Location
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
            {user?.city || 'Pakistan'} {user?.area ? `(${user.area})` : ''}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 6 }}>
            Registration Status
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)' }}>
            Active & Operational
          </div>
        </div>
      </div>
    </div>
  );
}
