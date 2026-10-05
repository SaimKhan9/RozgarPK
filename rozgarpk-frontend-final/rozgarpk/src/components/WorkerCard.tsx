import { useNavigate } from 'react-router-dom';
import type { Worker } from '../types';

interface Props {
  worker: Worker;
  onHire?: () => void;
}

export default function WorkerCard({ worker, onHire }: Props) {
  const navigate = useNavigate();
  const { profile } = worker;

  return (
    <div
      className="card"
      style={{ padding: 20, cursor: 'pointer' }}
      onClick={() => navigate(`/worker/${worker.id}`)}
    >
      {/* Top */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--green), var(--green-light))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, flexShrink: 0, border: '2px solid var(--green-pale)',
        }}>{worker.avatar}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>
            {worker.name}
            {profile.isVerified && (
              <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, marginLeft: 6 }}>✓ Verified</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>{profile.subCategory}</div>
          <div className="stars">
            {'★'.repeat(Math.round(profile.rating))}{'☆'.repeat(5 - Math.round(profile.rating))}
            <span style={{ color: 'var(--ink-soft)', fontSize: 11, marginLeft: 4 }}>({profile.totalReviews})</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {profile.skills.slice(0, 3).map(skill => (
          <span key={skill} style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 6,
            background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink-mid)',
          }}>{skill}</span>
        ))}
      </div>

      {/* Location */}
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 14 }}>
        📍 {worker.area}, {worker.city} &nbsp;·&nbsp; {profile.experience} yrs exp
        {profile.hasOwnVehicle && <span style={{ marginLeft: 8 }}>🚗 Own Car</span>}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTop: '1.5px solid var(--border)',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--green)' }}>
            Rs. {profile.ratePerDay.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-soft)' }}>/day</span>
          </div>
          {profile.ratePerMonth && (
            <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Rs. {profile.ratePerMonth.toLocaleString()}/month</div>
          )}
        </div>
        <button
          className="btn btn-amber btn-sm"
          onClick={e => { e.stopPropagation(); onHire?.(); }}
        >Hire Now</button>
      </div>
    </div>
  );
}
