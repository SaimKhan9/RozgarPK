import { useParams, useNavigate } from 'react-router-dom';
import { mockWorkers, mockReviews } from '../data/mockData';

interface Props { showToast: (msg: string) => void; }

export default function WorkerProfile({ showToast }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const worker = mockWorkers.find(w => w.id === id) || mockWorkers[0];
  const reviews = mockReviews[worker.id] || [];
  const { profile } = worker;

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px' }}>

      {/* Hero card */}
      <div style={{
        background: 'var(--green)', borderRadius: 14, overflow: 'hidden', marginBottom: 20,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        }} />
        <div style={{ padding: 28, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 14, flexShrink: 0,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            }}>{worker.avatar}</div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: -0.4, marginBottom: 4 }}>
                {worker.name}
                {profile.isVerified && (
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#4ade80', marginLeft: 8 }}>✓ Verified</span>
                )}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>
                {profile.subCategory} · {worker.city}
              </div>
              <div style={{ color: '#F59E0B', fontSize: 15 }}>
                {'★'.repeat(Math.round(profile.rating))}
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginLeft: 6 }}>
                  {profile.rating} rating · {profile.totalReviews} reviews
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: -0.8 }}>
                Rs. {profile.ratePerDay.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>per day</div>
              {profile.ratePerHour && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  Rs. {profile.ratePerHour}/hour also
                </div>
              )}
            </div>
          </div>

          {/* Chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {[
              `📍 ${worker.area}, ${worker.city}`,
              `⏰ ${profile.experience} Years Experience`,
              `✅ ${profile.totalJobsDone} Jobs Done`,
              '📞 Phone Verified',
              profile.isAvailable ? '🟢 Available Now' : '🔴 Busy',
              ...(profile.hasOwnVehicle ? [`🚗 ${profile.vehicleModel}`] : []),
              ...(profile.licenseType ? [`🪪 License: ${profile.licenseType}`] : []),
            ].map(chip => (
              <span key={chip} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 20, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.8)',
              }}>{chip}</span>
            ))}
          </div>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, marginBottom: 20, maxWidth: 560 }}>
            {profile.bio}
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-lg" style={{ flex: 1, background: 'white', color: 'var(--ink)', justifyContent: 'center' }}
              onClick={() => navigate('/chat')}>💬 Send Message</button>
            <button className="btn btn-lg btn-amber" style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => showToast('📋 Proposal sent to worker!')}>📋 Send to My Job</button>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Skills & Expertise</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {profile.skills.map(skill => (
            <span key={skill} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'var(--green-pale)', color: 'var(--green)',
            }}>{skill}</span>
          ))}
        </div>
      </div>

      {/* Work Photos */}
      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Work Photos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {profile.workPhotos.map((photo, i) => (
            <div key={i} style={{
              aspectRatio: '1', borderRadius: 10, background: 'var(--green-pale)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
            }}>{photo}</div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>Reviews ({profile.totalReviews})</h3>
        {reviews.length > 0 ? reviews.map(r => (
          <div key={r.id} style={{ padding: '14px 0', borderBottom: '1.5px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{r.clientName}</span>
              <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.55 }}>{r.comment}</p>
          </div>
        )) : (
          <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>No reviews yet for this worker.</p>
        )}
      </div>
    </div>
  );
}
