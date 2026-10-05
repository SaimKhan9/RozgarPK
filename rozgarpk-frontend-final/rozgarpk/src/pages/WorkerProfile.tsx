import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workersAPI, reviewsAPI, chatAPI } from '../api/services';
import type { Worker } from '../types';

interface Props {
  showToast: (msg: string) => void;
}

export default function WorkerProfile({ showToast }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMessaging, setIsMessaging] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadWorkerData = async () => {
      try {
        const res = await workersAPI.getById(id);
        if (!isMounted) return;
        const data = res.data?.data;
        if (!data) {
          setError('Worker profile not found.');
          return;
        }
        setWorker(data);

        // Fetch real reviews
        try {
          const revRes = await reviewsAPI.getWorkerReviews(id);
          if (isMounted) {
            const revList = revRes.data?.data?.reviews || revRes.data?.data || [];
            setReviews(Array.isArray(revList) ? revList : []);
          }
        } catch {
          if (isMounted) setReviews([]);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Fetch worker profile error:', err);
        setError(err?.response?.data?.message || 'Worker profile could not be loaded.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadWorkerData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSendMessage = async () => {
    if (!worker) return;
    setIsMessaging(true);
    try {
      const res = await chatAPI.startRoom({ targetUserId: worker.id });
      const roomId = res.data?.data?.id;
      navigate('/chat', { state: { roomId } });
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Please sign in to message this worker.');
    } finally {
      setIsMessaging(false);
    }
  };

  const handleCall = () => {
    if (!worker) return;
    if (worker.phone) {
      window.location.href = `tel:${worker.phone}`;
    } else {
      showToast('Worker has not listed a public phone number. Please use chat.');
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 820, margin: '60px auto', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Loading Worker Profile...</h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Please wait while we fetch the latest profile details.</p>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
            Worker Profile Not Found
          </h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            {error || 'This worker profile does not exist or has been deactivated.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/browse')}>
              👷 Browse All Workers
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const profile = worker.profile || ({} as any);
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const workPhotos = Array.isArray(profile.workPhotos) ? profile.workPhotos : [];
  const rating = Number(profile.rating || 0);
  const totalReviews = Number(profile.totalReviews || reviews.length || 0);
  const ratePerDay = Number(profile.ratePerDay || 0);
  const ratePerHour = profile.ratePerHour != null ? Number(profile.ratePerHour) : null;
  const ratePerMonth = profile.ratePerMonth != null ? Number(profile.ratePerMonth) : null;

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px 64px' }}>

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
            {/* Avatar */}
            <div style={{
              width: 76, height: 76, borderRadius: 16, flexShrink: 0,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
              overflow: 'hidden', color: 'white', fontWeight: 800, border: '2px solid rgba(255,255,255,0.25)',
            }}>
              {worker.avatar && (worker.avatar.startsWith('http') || worker.avatar.startsWith('data:')) ? (
                <img src={worker.avatar} alt={worker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                worker.avatar || worker.name?.charAt(0).toUpperCase() || '👷'
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: -0.4, marginBottom: 4 }}>
                {worker.name}
                {profile.isVerified && (
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#4ade80', marginLeft: 8, background: 'rgba(74, 222, 128, 0.15)', padding: '2px 8px', borderRadius: 12 }}>
                    ✓ Verified
                  </span>
                )}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                {profile.subCategory || profile.category || 'Local Worker'}
                {worker.city ? ` · ${worker.city}` : ''}
                {worker.area ? `, ${worker.area}` : ''}
              </div>
              <div style={{ color: '#F59E0B', fontSize: 15 }}>
                {rating > 0 ? '★'.repeat(Math.min(5, Math.max(1, Math.round(rating)))) : '⭐'}
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginLeft: 6 }}>
                  {rating > 0 ? `${rating.toFixed(1)} rating` : 'New Worker'} · {totalReviews} reviews
                </span>
              </div>
            </div>

            {/* Rates */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: -0.8 }}>
                Rs. {ratePerDay > 0 ? ratePerDay.toLocaleString() : 'Negotiable'}
              </div>
              {ratePerDay > 0 && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>per day</div>}
              {ratePerHour && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
                  Rs. {ratePerHour.toLocaleString()}/hour
                </div>
              )}
              {ratePerMonth && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                  Rs. {ratePerMonth.toLocaleString()}/month
                </div>
              )}
            </div>
          </div>

          {/* Chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {[
              worker.city ? `📍 ${worker.area ? `${worker.area}, ` : ''}${worker.city}` : null,
              profile.experience ? `⏰ ${profile.experience} Years Experience` : null,
              profile.totalJobsDone ? `✅ ${profile.totalJobsDone} Jobs Done` : '✅ Ready for Hire',
              worker.phone ? `📞 ${worker.phone}` : null,
              profile.isAvailable !== false ? '🟢 Available Now' : '🔴 Busy',
              profile.hasOwnVehicle ? (profile.vehicleModel ? `🚗 ${profile.vehicleModel}` : '🚗 Own Vehicle') : null,
              profile.licenseType ? `🪪 License: ${profile.licenseType}` : null,
            ].filter(Boolean).map(chip => (
              <span key={chip as string} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px',
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 20, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.85)',
              }}>{chip}</span>
            ))}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, marginBottom: 20, maxWidth: 620 }}>
              {profile.bio}
            </p>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="btn btn-lg"
              style={{ flex: 1, minWidth: 160, background: 'white', color: 'var(--ink)', justifyContent: 'center', fontWeight: 700 }}
              onClick={handleSendMessage}
              disabled={isMessaging}
            >
              {isMessaging ? 'Starting chat...' : '💬 Send Message'}
            </button>
            <button
              className="btn btn-lg btn-amber"
              style={{ flex: 1, minWidth: 160, justifyContent: 'center', fontWeight: 700 }}
              onClick={handleCall}
            >
              📞 {worker.phone ? `Call ${worker.phone}` : 'Contact Worker'}
            </button>
          </div>
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Skills & Expertise</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {skills.map((skill: string) => (
              <span key={skill} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'var(--green-pale)', color: 'var(--green)',
              }}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Work Photos */}
      {workPhotos.length > 0 && (
        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Work Portfolio</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {workPhotos.map((photo: string, i: number) => (
              photo.startsWith('http') || photo.startsWith('data:') ? (
                <img key={i} src={photo} alt={`Work sample ${i + 1}`} style={{
                  width: '100%', height: 160, borderRadius: 10, objectFit: 'cover',
                  border: '1px solid var(--border)',
                }} />
              ) : (
                <div key={i} style={{
                  height: 120, borderRadius: 10, background: 'var(--green-pale)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                }}>{photo}</div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>
          Reviews ({reviews.length})
        </h3>
        {reviews.length > 0 ? reviews.map((r: any) => (
          <div key={r.id} style={{ padding: '14px 0', borderBottom: '1.5px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                {r.client_name || r.clientName || 'Client'}
              </span>
              <span className="stars">
                {'★'.repeat(Math.round(r.rating || 5))}{'☆'.repeat(5 - Math.round(r.rating || 5))}
              </span>
            </div>
            {r.job_title && (
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 4 }}>Job: {r.job_title}</div>
            )}
            <p style={{ fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.55 }}>{r.comment}</p>
          </div>
        )) : (
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '8px 0' }}>
            No reviews yet for this worker. Hire and be the first to leave a review!
          </p>
        )}
      </div>
    </div>
  );
}
