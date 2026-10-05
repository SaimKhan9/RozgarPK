import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CITIES } from '../data/mockData';

interface Props { showToast: (msg: string) => void; }

export default function Register({ showToast }: Props) {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole]         = useState<'client' | 'worker'>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    city: 'Islamabad', area: '',
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('Please fill in all required fields'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password)) {
      setError('Password must be at least 8 characters and include an uppercase letter, a number, and a symbol'); return;
    }
    setIsLoading(true); setError('');
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role, city: form.city, area: form.area });
      showToast('🎉 Account created! Welcome to RozgarPK.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const responseMessage = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
      setError(typeof responseMessage === 'string' ? responseMessage : err instanceof Error ? err.message : 'Registration failed');
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - var(--nav-height))' }}>
      <div style={{ background: 'var(--green)', padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
        <h2 style={{ fontSize: 30, fontWeight: 800, color: 'white', letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 14, position: 'relative' }}>Earn on your terms,<br />on your schedule</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: 32, position: 'relative' }}>Register on RozgarPK and reach thousands of clients. Free forever.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
          {[{ icon: '🆓', text: 'Registration is completely free' }, { icon: '📍', text: 'See jobs near your area' }, { icon: '⭐', text: 'Build your reputation with reviews' }, { icon: '💰', text: 'Set your own rates' }].map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflowY: 'auto' }}>
        <div className="card" style={{ padding: 36, width: '100%', maxWidth: 440 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.4, marginBottom: 6 }}>Create Account</h3>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 20 }}>Who are you? Select your role.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            {(['client', 'worker'] as const).map(r => (
              <div key={r} onClick={() => setRole(r)} style={{ padding: 14, border: `2px solid ${role === r ? 'var(--green)' : 'var(--border)'}`, background: role === r ? 'var(--green-pale)' : 'white', borderRadius: 10, textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{r === 'client' ? '👤' : '👷'}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{r === 'client' ? 'Client' : 'Worker'}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{r === 'client' ? 'I need work done' : 'I do the work'}</div>
              </div>
            ))}
          </div>

          {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#991B1B' }}>❌ {error}</div>}

          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" placeholder="0300..." value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="form-group"><label className="form-label">City</label><select className="form-select" value={form.city} onChange={e => set('city', e.target.value)}>{CITIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Area</label><input className="form-input" placeholder="G-10, DHA..." value={form.area} onChange={e => set('area', e.target.value)} /></div>
          </div>

          {role === 'worker' && (
            <div style={{ background: 'var(--green-pale)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>
              👷 Worker — you can add your skills and rates after registration from your dashboard.
            </div>
          )}

          <div className="form-group"><label className="form-label">Password *</label><input type="password" className="form-input" placeholder="8+ characters, uppercase, number, symbol" value={form.password} onChange={e => set('password', e.target.value)} /></div>
          <div className="form-group" style={{ marginBottom: 20 }}><label className="form-label">Confirm Password *</label><input type="password" className="form-input" placeholder="••••••••" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} /></div>

          <button className="btn btn-primary btn-full btn-lg" onClick={handleRegister} disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? '⏳ Creating account...' : 'Create Account'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-soft)', marginTop: 16 }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
