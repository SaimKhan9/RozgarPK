import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CATEGORIES, SUBCATEGORIES, CITIES } from '../data/mockData';
import { jobsAPI, uploadAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import type { Category } from '../types';

interface Props { showToast: (msg: string) => void; }

const durations = ['1 Day','1 Week','1 Month','3 Months','6 Months','Full Project'];
const durMap: Record<string,string> = { '1 Day':'1day','1 Week':'1week','1 Month':'1month','3 Months':'3months','6 Months':'6months','Full Project':'full-project' };

export default function PostJob({ showToast }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const initialCategory = (searchParams.get('category') as Category) || 'home-services';
  const [category, setCategory] = useState<Category>(
    CATEGORIES.some(c => c.id === initialCategory) ? initialCategory : 'home-services'
  );
  const [duration, setDuration] = useState('1 Day');
  const [paymentType, setPaymentType] = useState('Fixed');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', budget: '', budgetMax: '', city: user?.city || 'Islamabad', area: user?.area || '', subCategory: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const catParam = searchParams.get('category') as Category;
    if (catParam && CATEGORIES.some(c => c.id === catParam)) {
      setCategory(catParam);
    }
  }, [searchParams]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadAPI.uploadImage(file);
      setImageUrl(url);
      showToast('📸 Photo uploaded!');
    } catch {
      showToast('❌ Photo upload failed. Make sure Cloudinary is configured.');
    } finally { setUploadingImage(false); }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) { showToast('⚠️ Please login first'); navigate('/login'); return; }
    if (user?.role === 'worker') {
      setError('Only clients can post jobs. Please switch to a Client account.');
      showToast('⚠️ Only Client accounts can post jobs.');
      return;
    }
    if (!form.title || !form.description || !form.budget) {
      setError('Please fill in title, description, and budget');
      showToast('⚠️ Please fill all required fields');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await jobsAPI.create({
        title: form.title.trim(),
        description: form.description.trim(),
        category,
        subCategory: form.subCategory || SUBCATEGORIES[category][0],
        budget: parseFloat(form.budget),
        budgetMax: form.budgetMax ? parseFloat(form.budgetMax) : undefined,
        paymentType: paymentType.toLowerCase().replace(' ', '-'),
        duration: durMap[duration] || '1day',
        city: form.city,
        area: form.area,
        isUrgent,
        imageUrl: imageUrl || undefined,
      });
      showToast('✅ Job posted successfully! Workers will send proposals.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to post job. Please try again.';
      setError(msg);
      showToast(`❌ ${msg}`);
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.5, marginBottom: 6 }}>Post a New Job</h2>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Describe your task — qualified workers will send you proposals.</p>
      </div>

      {user?.role === 'worker' && (
        <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 10, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 24 }}>👷</span>
          <div>
            <div style={{ fontWeight: 700, color: '#92400E', fontSize: 14 }}>You are signed in with a Worker account</div>
            <div style={{ color: '#B45309', fontSize: 13, marginTop: 2 }}>
              Only Client accounts can post jobs. <Link to="/register" style={{ fontWeight: 600, textDecoration: 'underline' }}>Register as a Client</Link> or log in with your client account to post a job.
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 10, padding: '14px 18px', marginBottom: 24, color: '#991B1B', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>❌</span> {error}
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Job Details */}
        <div style={{ padding: 24, borderBottom: '1.5px solid var(--border)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>Job Details</p>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value as Category)}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Sub-Category</label>
            <select className="form-select" value={form.subCategory} onChange={e => set('subCategory', e.target.value)}>
              {SUBCATEGORIES[category].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input className="form-input" placeholder="e.g. Bathroom pipe leak needs fixing" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Full Description *</label>
            <textarea className="form-textarea" placeholder="What is the problem? What needs to be done? Any special requirements?" value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
        </div>

        {/* Budget */}
        <div style={{ padding: 24, borderBottom: '1.5px solid var(--border)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>Budget & Duration</p>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Budget (Rs.) *</label>
              <input type="number" className="form-input" placeholder="e.g. 2000" value={form.budget} onChange={e => set('budget', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Max Budget (optional)</label>
              <input type="number" className="form-input" placeholder="e.g. 3500" value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Payment Type</label>
            <div className="toggle-group">
              {['Fixed','Per Day','Monthly','Negotiable'].map(pt => (
                <button key={pt} className={`toggle-pill ${paymentType === pt ? 'active' : ''}`} style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setPaymentType(pt)}>{pt}</button>
              ))}
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Duration</label>
            <div className="toggle-group">
              {durations.map(d => <button key={d} className={`toggle-pill ${duration === d ? 'active' : ''}`} onClick={() => setDuration(d)}>{d}</button>)}
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--amber)' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-mid)' }}>⚡ This is Urgent — Need it Today or Tomorrow</span>
          </label>
        </div>

        {/* Location */}
        <div style={{ padding: 24, borderBottom: '1.5px solid var(--border)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>Location</p>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">City</label>
              <select className="form-select" value={form.city} onChange={e => set('city', e.target.value)}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Area / Neighbourhood</label>
              <input className="form-input" placeholder="e.g. G-10, DHA..." value={form.area} onChange={e => set('area', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div style={{ padding: 24, borderBottom: '1.5px solid var(--border)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>Problem Photo (Optional)</p>
          {imageUrl ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={imageUrl} alt="Uploaded" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />
              <button onClick={() => setImageUrl('')} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}>✕ Remove</button>
            </div>
          ) : (
            <label className="upload-zone" style={{ display: 'block', cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              <div style={{ fontSize: 28, marginBottom: 8 }}>{uploadingImage ? '⏳' : '📸'}</div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                {uploadingImage ? 'Uploading...' : <><strong style={{ color: 'var(--green)' }}>Click to upload</strong> a photo of the problem</>}
              </p>
              <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>JPG, PNG — max 5MB</p>
            </label>
          )}
        </div>

        <div style={{ padding: 20, background: 'var(--surface)' }}>
          <button className="btn btn-primary btn-full btn-lg" onClick={handleSubmit} disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? '⏳ Posting job...' : 'Post Job'}
          </button>
        </div>
      </div>
    </div>
  );
}
