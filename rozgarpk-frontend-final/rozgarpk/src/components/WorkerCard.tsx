import { useNavigate } from 'react-router-dom';
import type { Worker } from '../types';

interface Props {
  worker: Worker;
  onHire?: () => void;
}

export default function WorkerCard({ worker, onHire }: Props) {
  const navigate = useNavigate();
  const profile = worker?.profile || ({} as any);
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const rating = Number(profile.rating || 0);
  const ratePerDay = Number(profile.ratePerDay || 0);
  const ratePerMonth = profile.ratePerMonth != null ? Number(profile.ratePerMonth) : null;
  const experience = profile.experience != null ? Number(profile.experience) : null;

  return (
    <div
      className="card"
      style={{ padding: 20, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
      onClick={() => navigate(`/worker/${worker.id}`)}
    >
      {/* Top */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--green), var(--green-light))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0, border: '2px solid var(--green-pale)',
          overflow: 'hidden', color: 'white', fontWeight: 800,
        }}>
          {worker.avatar && (worker.avatar.startsWith('http') || worker.avatar.startsWith('data:')) ? (
            <img src={worker.avatar} alt={worker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            worker.avatar || worker.name?.charAt(0).toUpperCase() || '👷'
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>
            {worker.name}
            {profile.isVerified && (
              <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, marginLeft: 6 }}>✓ Verified</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>
            {profile.subCategory || profile.category || 'Worker'}
          </div>
          <div className="stars">
            {rating > 0 ? (
              <>
                {'★'.repeat(Math.min(5, Math.max(1, Math.round(rating))))}
                {'☆'.repeat(Math.max(0, 5 - Math.min(5, Math.max(1, Math.round(rating)))))}
              </>
            ) : (
              '⭐'
            )}
            <span style={{ color: 'var(--ink-soft)', fontSize: 11, marginLeft: 4 }}>
              ({profile.totalReviews || 0})
            </span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {skills.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {skills.slice(0, 3).map((skill: string) => (
            <span key={skill} style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 6,
              background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink-mid)',
            }}>{skill}</span>
          ))}
        </div>
      )}

      {/* Location */}
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 14 }}>
        📍 {worker.area ? `${worker.area}, ` : ''}{worker.city || 'Pakistan'}
        {experience !== null && ` · ${experience} yrs exp`}
        {profile.hasOwnVehicle && <span style={{ marginLeft: 8 }}>🚗 Own Car</span>}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTop: '1.5px solid var(--border)',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--green)' }}>
            Rs. {ratePerDay > 0 ? ratePerDay.toLocaleString() : 'Negotiable'}
            {ratePerDay > 0 && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-soft)' }}>/day</span>}
          </div>
          {ratePerMonth && (
            <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Rs. {ratePerMonth.toLocaleString()}/month</div>
          )}
        </div>
        <button
          className="btn btn-amber btn-sm"
          onClick={e => { e.stopPropagation(); onHire?.(); }}
        >Contact</button>
      </div>
    </div>
  );
}
