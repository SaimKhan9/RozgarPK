import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: 52, paddingBottom: 60 }}>
      <div className="card" style={{ padding: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.7, marginBottom: 8 }}>Reset password</h1>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>Enter the email linked to your account and we’ll send a reset link.</p>

        <div className="form-group">
          <label className="form-label">Email address</label>
          <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <button className="btn btn-primary btn-full" type="button">Send reset link</button>
      </div>
    </div>
  );
}
