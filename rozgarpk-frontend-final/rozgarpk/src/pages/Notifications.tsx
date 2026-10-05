export default function NotificationsPage() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 52 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8 }}>Notifications</h1>
      </div>

      <div className="card" style={{ padding: 24, color: 'var(--ink-soft)' }}>You have no notifications.</div>
    </div>
  );
}
