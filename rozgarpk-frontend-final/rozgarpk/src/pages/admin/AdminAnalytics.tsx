export default function AdminAnalytics() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, marginBottom: 20 }}>Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3>Jobs posted per day</h3>
          <div style={{ height: 220, background: 'linear-gradient(180deg, #E8F5EE, #F7FAF8)', borderRadius: 12, display: 'grid', placeItems: 'center', color: 'var(--ink-soft)' }}>Line chart placeholder</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3>Top categories</h3>
          <div style={{ height: 220, background: 'linear-gradient(135deg, #EFF6FF, #F7FAF8)', borderRadius: 12, display: 'grid', placeItems: 'center', color: 'var(--ink-soft)' }}>Pie chart placeholder</div>
        </div>
      </div>
    </div>
  );
}
