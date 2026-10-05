import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="card" style={{ padding: 24 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, marginBottom: 16 }}>My profile</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24 }}>
          <div style={{ width: 160, height: 160, borderRadius: 20, background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)', display: 'grid', placeItems: 'center', color: 'white', fontSize: 52, fontWeight: 800 }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <div><strong>Name:</strong> {user?.name}</div>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Phone:</strong> {user?.phone}</div>
            <div><strong>Role:</strong> {user?.role}</div>
            <div><strong>Location:</strong> {user?.city}, {user?.area}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
