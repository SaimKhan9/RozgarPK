const workers = [
  { id: '1', name: 'Usman Ali', category: 'Home Services', city: 'Islamabad', rating: 4.9, jobsDone: 87, verified: true },
  { id: '2', name: 'Bilal Ahmed', category: 'Plumbing', city: 'Lahore', rating: 4.2, jobsDone: 31, verified: false },
  { id: '3', name: 'Sana Malik', category: 'Education', city: 'Karachi', rating: 4.8, jobsDone: 52, verified: true },
];

export default function AdminWorkers() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, marginBottom: 20 }}>Workers management</h1>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f5faf7' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: 12 }}>Name</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Category</th>
              <th style={{ textAlign: 'left', padding: 12 }}>City</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Rating</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Jobs done</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Verified</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker) => (
              <tr key={worker.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: 12 }}>{worker.name}</td>
                <td style={{ padding: 12 }}>{worker.category}</td>
                <td style={{ padding: 12 }}>{worker.city}</td>
                <td style={{ padding: 12 }}>{worker.rating}</td>
                <td style={{ padding: 12 }}>{worker.jobsDone}</td>
                <td style={{ padding: 12 }}>{worker.verified ? 'Verified' : 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
