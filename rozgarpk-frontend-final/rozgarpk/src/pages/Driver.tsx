import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workersAPI, chatAPI } from '../api/services';

interface Props { showToast: (msg: string) => void; }

const durations = ['1 Day','2 Days','3 Days','1 Week','2 Weeks','1 Month','Custom'];
const purposes  = ['🏠 Daily Routine','✈️ Airport Drop/Pick','🏕️ Trip / Tour','🏥 Medical','🏢 Office Duty','🛍️ Shopping'];
const payments  = ['💰 Per Day','📅 Weekly','🗓️ Monthly','🏁 Full Trip'];

export default function Driver({ showToast }: Props) {
  const navigate = useNavigate();
  const [driverType, setDriverType] = useState<'with-car' | 'without-car'>('with-car');
  const [duration, setDuration]     = useState('1 Day');
  const [purpose, setPurpose]       = useState('🏠 Daily Routine');
  const [payment, setPayment]       = useState('💰 Per Day');
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const startConversation = async (targetUserId: string) => {
    try {
      const res = await chatAPI.startRoom({ targetUserId });
      navigate('/chat', { state: { roomId: res.data?.data?.id } });
    } catch {
      showToast('Please sign in with a client account to message this driver.');
    }
  };

  useEffect(() => {
    const loadDrivers = async () => {
      setIsLoading(true);
      try {
        const res = await workersAPI.getAll({ category: 'driver' });
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : (res.data?.data?.workers ?? []);
        setDrivers(list);
      } catch {
        setDrivers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDrivers();
  }, []);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a3c5e, #2563a0)',
        borderRadius: 14, padding: 28, marginBottom: 24, color: 'white',
      }}>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>🚘 Driver Service</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Hire a Driver — On Your Terms</div>
        <div style={{ fontSize: 14, opacity: 0.8 }}>
          1 day or as many days as you need — with or without a car. Clear rates, no hassle.
        </div>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        {/* Driver Type */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
          Select Driver Type
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          {([
            { type: 'with-car' as const,    icon: '🚗', title: 'With Own Car',  sub: 'Driver brings his own vehicle',  rate: 'Rs. 2,000 – 4,000 / day' },
            { type: 'without-car' as const, icon: '👨‍✈️', title: 'Driver Only',   sub: 'Will drive your car',            rate: 'Rs. 800 – 1,500 / day'   },
          ]).map(opt => (
            <div key={opt.type} onClick={() => setDriverType(opt.type)} style={{
              border: `2px solid ${driverType === opt.type ? 'var(--green)' : 'var(--border)'}`,
              background: driverType === opt.type ? 'var(--green-pale)' : 'white',
              borderRadius: 10, padding: 18, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{opt.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{opt.title}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 10 }}>{opt.sub}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>{opt.rate}</div>
            </div>
          ))}
        </div>

        {/* Duration */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 10 }}>How Many Days?</p>
        <div className="toggle-group" style={{ marginBottom: 18 }}>
          {durations.map(d => (
            <button key={d} className={`toggle-pill ${duration === d ? 'active' : ''}`} onClick={() => setDuration(d)}>{d}</button>
          ))}
        </div>

        {/* Payment */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 10 }}>Payment Method</p>
        <div className="toggle-group" style={{ marginBottom: 18 }}>
          {payments.map(p => (
            <button key={p} className={`toggle-pill ${payment === p ? 'active' : ''}`} onClick={() => setPayment(p)}>{p}</button>
          ))}
        </div>

        {/* Purpose */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 10 }}>Purpose</p>
        <div className="toggle-group" style={{ marginBottom: 18 }}>
          {purposes.map(p => (
            <button key={p} className={`toggle-pill ${purpose === p ? 'active' : ''}`} onClick={() => setPurpose(p)}>{p}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn btn-primary btn-lg"
            style={{ flex: 2 }}
            onClick={() => navigate('/post-job?category=driver')}
          >
            🚘 Post a Driver Job
          </button>
          <button
            className="btn btn-ghost btn-lg"
            style={{ flex: 1 }}
            onClick={() => navigate('/browse?category=driver')}
          >
            Browse All Drivers
          </button>
        </div>
      </div>

      {/* Available Drivers */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>
        Available Drivers ({drivers.length})
      </h3>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-soft)' }}>
          ⏳ Loading drivers...
        </div>
      ) : drivers.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>
          <p style={{ marginBottom: 12 }}>No drivers registered yet.</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/post-job?category=driver')}>
            Post a Driver Requirement
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16 }}>
          {drivers.map((d, i) => {
            const profile = d.profile || {};
            const rates = [
              ['Per Day', `Rs. ${Number(profile.ratePerDay || 0).toLocaleString()}`],
              ...(profile.ratePerMonth ? [['Monthly', `Rs. ${Number(profile.ratePerMonth).toLocaleString()}`]] : []),
            ];
            const badge = profile.hasOwnVehicle ? '🚗 Own Car' : '👤 Driver Only';
            return (
              <div
                key={d.id || i}
                className="card"
                style={{ padding: 20, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onClick={() => navigate(`/worker/${d.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: 'linear-gradient(135deg,var(--green),var(--green-light))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                      overflow: 'hidden', color: 'white', fontWeight: 800
                    }}>
                      {d.avatar && (d.avatar.startsWith('http') || d.avatar.startsWith('data:')) ? (
                        <img src={d.avatar} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        d.avatar || d.name?.charAt(0).toUpperCase() || '🧑‍✈️'
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>{profile.subCategory || 'Professional Driver'}</div>
                      <div className="stars">
                        {'★'.repeat(Math.round(profile.rating || 5))}
                        <span style={{ fontSize: 11, color: 'var(--ink-soft)', marginLeft: 4 }}>({profile.totalReviews || 0})</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: profile.hasOwnVehicle ? 'var(--green-pale)' : 'var(--amber-light)', color: profile.hasOwnVehicle ? 'var(--green)' : '#92400E', whiteSpace: 'nowrap' }}>
                    {badge}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {(profile.skills || ['Driver']).slice(0, 3).map((t: string) => (
                    <span key={t} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink-mid)' }}>{t}</span>
                  ))}
                </div>

                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 10 }}>
                  📍 {d.city || 'Pakistan'} {d.area ? `· ${d.area}` : ''} {profile.experience ? `· ${profile.experience} yrs` : ''}
                </div>

                <div style={{ background: 'var(--surface)', borderRadius: 8, padding: 10, marginBottom: 12 }}>
                  {rates.map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                      <span style={{ color: 'var(--ink-mid)' }}>{label}:</span>
                      <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{val}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1.5px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>
                      Rs. {Number(profile.ratePerDay || 0).toLocaleString()}/day
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                      {profile.hasOwnVehicle ? 'Fuel charged separately' : 'Will use your car'}
                    </div>
                  </div>
                  <button
                    className="btn btn-amber btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      startConversation(d.id);
                    }}
                  >
                    Message
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
