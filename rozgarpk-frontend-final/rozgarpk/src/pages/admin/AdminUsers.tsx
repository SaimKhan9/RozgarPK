const users = [
  { id: '1', name: 'Ali Hassan', email: 'ali@example.com', phone: '0300-1234567', role: 'worker', city: 'Islamabad', verified: true, active: true },
  { id: '2', name: 'Sara Khan', email: 'sara@example.com', phone: '0301-2345678', role: 'client', city: 'Lahore', verified: true, active: false },
  { id: '3', name: 'Zubair Ali', email: 'zubair@example.com', phone: '0302-3456789', role: 'worker', city: 'Karachi', verified: false, active: true },
];

export default function AdminUsers() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, marginBottom: 20 }}>Users management</h1>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f5faf7' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: 12 }}>Name</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Email</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Role</th>
              <th style={{ textAlign: 'left', padding: 12 }}>City</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Verified</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: 12 }}>{user.name}</td>
                <td style={{ padding: 12 }}>{user.email}</td>
                <td style={{ padding: 12 }}>{user.role}</td>
                <td style={{ padding: 12 }}>{user.city}</td>
                <td style={{ padding: 12 }}>{user.verified ? 'Yes' : 'No'}</td>
                <td style={{ padding: 12 }}>{user.active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
