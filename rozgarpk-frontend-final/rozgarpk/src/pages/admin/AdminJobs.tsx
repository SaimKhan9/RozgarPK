const jobs = [
  { id: '1', title: 'Bathroom pipe leak', category: 'Plumbing', client: 'Ahmed Raza', city: 'Islamabad', budget: 'Rs 2500', status: 'Open', proposals: 3 },
  { id: '2', title: 'Laptop screen repair', category: 'Electronics', client: 'Sara Ali', city: 'Lahore', budget: 'Rs 5000', status: 'In progress', proposals: 2 },
  { id: '3', title: 'School tutor needed', category: 'Education', client: 'Nadia', city: 'Karachi', budget: 'Rs 7000', status: 'Closed', proposals: 5 },
];

export default function AdminJobs() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, marginBottom: 20 }}>Jobs management</h1>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f5faf7' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: 12 }}>Title</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Category</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Client</th>
              <th style={{ textAlign: 'left', padding: 12 }}>City</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Budget</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: 12 }}>{job.title}</td>
                <td style={{ padding: 12 }}>{job.category}</td>
                <td style={{ padding: 12 }}>{job.client}</td>
                <td style={{ padding: 12 }}>{job.city}</td>
                <td style={{ padding: 12 }}>{job.budget}</td>
                <td style={{ padding: 12 }}>{job.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
