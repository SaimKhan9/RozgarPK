import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props { showToast: (msg: string) => void; }

export default function Login({ showToast }: Props) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole]         = useState<'client' | 'worker'>('client');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setIsLoading(true); setError('');
    try {
      await login(email, password);
      showToast('✅ Login successful! Welcome back.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - var(--nav-height))' }}>
      <div style={{ background: 'var(--green)', padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
        <h2 style={{ fontSize: 30, fontWeight: 800, color: 'white', letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 14, position: 'relative' }}>
          Finding work in Pakistan<br />just got easier
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: 32, position: 'relative' }}>
          Thousands of verified workers, across all categories, in your city.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
          {[
            { icon: '✅', text: 'Verified and rated workers' },
            { icon: '⚡', text: 'Same-day service for urgent jobs' },
            { icon: '💬', text: 'Direct chat and call workers' },
            { icon: '🔒', text: 'Secure and private platform' },
          ].map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div className="card" style={{ padding: 36, width: '100%', maxWidth: 420 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.4, marginBottom: 6 }}>Welcome Back!</h3>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 24 }}>Login to your account</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {(['client', 'worker'] as const).map(r => (
              <div key={r} onClick={() => setRole(r)} style={{ padding: 14, border: `2px solid ${role === r ? 'var(--green)' : 'var(--border)'}`, background: role === r ? 'var(--green-pale)' : 'white', borderRadius: 10, textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{r === 'client' ? '👤' : '👷'}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{r === 'client' ? 'Client' : 'Worker'}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{r === 'client' ? 'I need work done' : 'I do the work'}</div>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#991B1B' }}>
              ❌ {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email or Phone Number</label>
            <input type="text" className="form-input" placeholder="email@example.com or 0300..." value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500, cursor: 'pointer' }}>Forgot password?</span>
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={handleLogin} disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? '⏳ Logging in...' : 'Login'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <Link to="/register">
            <button className="btn btn-ghost btn-full" style={{ marginBottom: 16 }}>Create New Account</button>
          </Link>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-soft)' }}>
            New here? <Link to="/register" style={{ color: 'var(--green)', fontWeight: 600 }}>Register now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
