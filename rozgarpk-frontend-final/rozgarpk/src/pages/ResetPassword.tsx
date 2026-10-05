import { useState } from 'react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: 52, paddingBottom: 60 }}>
      <div className="card" style={{ padding: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.7, marginBottom: 8 }}>Create new password</h1>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>Choose a new password for your RozgarPK account.</p>

        <div className="form-group">
          <label className="form-label">New password</label>
          <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm password</label>
          <input className="form-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>

        <button className="btn btn-primary btn-full" type="button">Update password</button>
      </div>
    </div>
  );
}
