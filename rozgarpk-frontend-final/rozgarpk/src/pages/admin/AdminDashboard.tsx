const stats = [
  { label: 'Total users', value: '12,480', accent: '#1B6B3A' },
  { label: 'Workers', value: '8,240', accent: '#2E8B57' },
  { label: 'Clients', value: '4,240', accent: '#E8820C' },
  { label: 'Jobs today', value: '318', accent: '#2563EB' },
];

export default function AdminDashboard() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, marginBottom: 24 }}>Admin dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map((stat) => (
          <div key={stat.label} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, letterSpacing: 0.2, textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{stat.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: stat.accent, marginTop: 10 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>User growth</h3>
          <div style={{ height: 220, background: 'linear-gradient(180deg, #E8F5EE, #F7FAF8)', borderRadius: 12, display: 'grid', placeItems: 'center', color: 'var(--ink-soft)' }}>Growth chart placeholder</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Top cities</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {['Islamabad', 'Lahore', 'Karachi', 'Rawalpindi'].map((city, idx) => (
              <div key={city}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>{city}</span>
                  <span>{[68, 56, 48, 39][idx]}%</span>
                </div>
                <div style={{ height: 10, background: '#E8F5EE', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${[68, 56, 48, 39][idx]}%`, height: '100%', background: 'var(--green)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
