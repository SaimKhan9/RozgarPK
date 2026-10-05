import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    console.log('Verifying email token:', token);
    const timer = setTimeout(() => navigate('/dashboard'), 1200);
    return () => clearTimeout(timer);
  }, [navigate, token]);

  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: 52, paddingBottom: 60 }}>
      <div className="card" style={{ padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 42, marginBottom: 12 }}>✅</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.7, marginBottom: 8 }}>Email verified</h1>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>Your account has been verified successfully. Redirecting you to your dashboard…</p>
      </div>
    </div>
  );
}
