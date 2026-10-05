import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, SUBCATEGORIES, CITIES } from '../data/mockData';
import { workersAPI, uploadAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import type { Category } from '../types';

interface Props { showToast?: (msg: string) => void; }

const CATEGORY_SKILLS: Record<string, string[]> = {
  'home-services': ['Plumbing','Electrical Wiring','Painting','Carpentry','Cleaning','Masonry','Welding','Tile Work','PVC Pipe Repair','Roof Fixing'],
  'electronics': ['Laptop Repair','Mobile Repair','TV Repair','AC Service','Fridge Repair','UPS/Solar Setup','CCTV','Networking/WiFi','LED Panel'],
  'automobile': ['Engine Repair','Car Wash','Tyre/Puncture','Car Wiring','Bike Repair','Oil Change','AC Coolant','Denting & Painting'],
  'education': ['Maths Tutor','Physics','Chemistry','Biology','English','Quran Teaching','Computer Basics','O/A Level Prep','Online Classes'],
  'delivery': ['Home Shifting','Cargo Van','Courier','Loading/Unloading','Fragile Items Moving','Grocery Delivery','Document Delivery'],
  'daily-labour': ['General Labour','Mason','Plaster Work','Tile Fixing','Slab Roof','Excavation','Construction Help','Scaffolding'],
  'domestic': ['Cooking','Baby Sitting','Elder Care','Maid/Housekeeper','Laundry','Grocery Shopping'],
  'outdoor': ['Gardening','Pest Control','Water Tank Cleaning','Tailoring','Cobbler','Exterior Painting'],
  'driver': ['With Own Car','Driver Only (Your Car)','Long Route Driver','Airport Pickup/Drop','Tour/Trip Driver','Office Duty Driver','Monthly Hire Available'],
};

const EXPERIENCE_OPTS = ['Less than 1 year','1–2 years','3–5 years','5–10 years','10+ years'];
const EXP_MAP: Record<string, number> = { 'Less than 1 year': 0, '1–2 years': 1, '3–5 years': 3, '5–10 years': 5, '10+ years': 10 };

export default function WorkerSetupPage({ showToast = () => {} }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category>('home-services');
  const [subCategory, setSubCategory] = useState(SUBCATEGORIES['home-services'][0]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [experienceLabel, setExperienceLabel] = useState(EXPERIENCE_OPTS[1]);
  const [bio, setBio] = useState('');
  const [ratePerDay, setRatePerDay] = useState('');
  const [ratePerHour, setRatePerHour] = useState('');
  const [ratePerMonth, setRatePerMonth] = useState('');
  const [city, setCity] = useState(user?.city || 'Islamabad');
  const [area, setArea] = useState(user?.area || '');
  const [hasOwnVehicle, setHasOwnVehicle] = useState(false);
  const [vehicleModel, setVehicleModel] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [workPhotos, setWorkPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSubCategory(SUBCATEGORIES[category][0]);
    setSelectedSkills([]);
  }, [category]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (s && !selectedSkills.includes(s)) {
      setSelectedSkills(prev => [...prev, s]);
    }
    setCustomSkill('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (workPhotos.length >= 4) { showToast('Maximum 4 photos allowed'); return; }
    setUploadingPhoto(true);
    try {
      const url = await uploadAPI.uploadImage(file);
      setWorkPhotos(prev => [...prev, url]);
      showToast('📸 Work photo uploaded!');
    } catch {
      showToast('❌ Photo upload failed. Configure Cloudinary to enable photos.');
    } finally { setUploadingPhoto(false); }
  };

  const handleSave = async () => {
    if (!ratePerDay || isNaN(parseFloat(ratePerDay))) {
      setError('Please enter your daily rate');
      return;
    }
    if (selectedSkills.length === 0) {
      setError('Please select at least one skill');
      return;
    }
    if (!bio.trim() || bio.trim().length < 30) {
      setError('Please write a bio of at least 30 characters');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await workersAPI.createProfile({
        category,
        subCategory,
        skills: selectedSkills,
        ratePerDay: parseFloat(ratePerDay),
        ratePerHour: ratePerHour ? parseFloat(ratePerHour) : undefined,
        ratePerMonth: ratePerMonth ? parseFloat(ratePerMonth) : undefined,
        experience: EXP_MAP[experienceLabel] ?? 1,
        bio: bio.trim(),
        licenseType: licenseType || undefined,
        hasOwnVehicle,
        vehicleModel: vehicleModel || undefined,
        city,
        area,
      } as any);
      showToast('🎉 Profile published! Clients can now find you.');
      navigate('/browse');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Could not save profile. Please try again.';
      setError(msg);
      showToast(`❌ ${msg}`);
    } finally { setIsLoading(false); }
  };

  const TOTAL_STEPS = category === 'driver' ? 4 : 4;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.6, marginBottom: 6 }}>
          Set Up Your Worker Profile
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
          Complete your profile to start appearing in search results and receiving job requests from clients.
        </p>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 5, borderRadius: 4,
            background: i < step ? 'var(--green)' : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* STEP 1: Category & Sub-category */}
      {step === 1 && (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 20 }}>
            Step 1 of {TOTAL_STEPS} — Your Profession
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Main Category *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 8 }}>
              {CATEGORIES.map(c => (
                <div key={c.id} onClick={() => setCategory(c.id as Category)}
                  style={{
                    padding: '12px 10px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                    border: `2px solid ${category === c.id ? 'var(--green)' : 'var(--border)'}`,
                    background: category === c.id ? 'var(--green-pale)' : 'white',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{c.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: category === c.id ? 'var(--green)' : 'var(--ink-mid)' }}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Sub-Category / Specialisation *</label>
            <select className="form-select" value={subCategory} onChange={e => setSubCategory(e.target.value)}>
              {SUBCATEGORIES[category].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Next — Skills →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Skills & Experience */}
      {step === 2 && (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 20 }}>
            Step 2 of {TOTAL_STEPS} — Skills & Experience
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Select Your Skills *</label>
            <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 10 }}>
              Select all skills that apply to your work.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(CATEGORY_SKILLS[category] || []).map(skill => (
                <button key={skill} type="button"
                  onClick={() => toggleSkill(skill)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    border: `1.5px solid ${selectedSkills.includes(skill) ? 'var(--green)' : 'var(--border)'}`,
                    background: selectedSkills.includes(skill) ? 'var(--green-pale)' : 'white',
                    color: selectedSkills.includes(skill) ? 'var(--green)' : 'var(--ink-mid)',
                    transition: 'all 0.12s',
                  }}>
                  {selectedSkills.includes(skill) ? '✓ ' : ''}{skill}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input className="form-input" placeholder="Add custom skill…" value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                style={{ flex: 1 }} />
              <button className="btn btn-ghost" type="button" onClick={addCustomSkill}>+ Add</button>
            </div>

            {selectedSkills.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedSkills.map(s => (
                  <span key={s} style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: 'var(--green)', color: 'white', display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {s}
                    <span style={{ cursor: 'pointer', fontSize: 10, opacity: 0.8 }}
                      onClick={() => toggleSkill(s)}>✕</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Years of Experience *</label>
            <div className="toggle-group">
              {EXPERIENCE_OPTS.map(e => (
                <button key={e} type="button"
                  className={`toggle-pill ${experienceLabel === e ? 'active' : ''}`}
                  onClick={() => setExperienceLabel(e)}
                  style={{ fontSize: 12 }}>{e}</button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Professional Bio *</label>
            <textarea className="form-textarea" rows={5}
              placeholder="Describe your experience, specialties, and what makes you a great choice for clients. Minimum 30 characters."
              value={bio} onChange={e => setBio(e.target.value)} />
            <div style={{ fontSize: 11, color: bio.length < 30 ? '#E11D48' : 'var(--ink-soft)', marginTop: 4, textAlign: 'right' }}>
              {bio.length} / 300 characters {bio.length < 30 ? `(need ${30 - bio.length} more)` : '✓'}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => {
              if (selectedSkills.length === 0) { setError('Please select at least one skill'); return; }
              if (bio.trim().length < 30) { setError('Bio must be at least 30 characters'); return; }
              setError('');
              setStep(3);
            }}>
              Next — Rates →
            </button>
          </div>
          {error && <div style={{ color: '#E11D48', fontSize: 13, marginTop: 10 }}>❌ {error}</div>}
        </div>
      )}

      {/* STEP 3: Rates & Location */}
      {step === 3 && (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 20 }}>
            Step 3 of {TOTAL_STEPS} — Rates & Location
          </div>

          <div style={{ background: 'var(--green-pale)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>
            💡 Set competitive rates to attract more clients. You can update these anytime from your dashboard.
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Rate per Day (Rs.) *</label>
              <input type="number" className="form-input" placeholder="e.g. 1500"
                value={ratePerDay} onChange={e => setRatePerDay(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Rate per Hour (Rs.) — Optional</label>
              <input type="number" className="form-input" placeholder="e.g. 300"
                value={ratePerHour} onChange={e => setRatePerHour(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Rate (Rs.) — Optional</label>
            <input type="number" className="form-input" placeholder="e.g. 25000 (for full-time / monthly hire)"
              value={ratePerMonth} onChange={e => setRatePerMonth(e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Your City *</label>
              <select className="form-select" value={city} onChange={e => setCity(e.target.value)}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Your Area / Neighbourhood</label>
              <input className="form-input" placeholder="e.g. G-10, DHA, Johar Town"
                value={area} onChange={e => setArea(e.target.value)} />
            </div>
          </div>

          {/* Driver-specific fields */}
          {(category === 'driver' || category === 'automobile') && (
            <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: 20, marginTop: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
                Vehicle Details
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
                <input type="checkbox" checked={hasOwnVehicle} onChange={e => setHasOwnVehicle(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--green)' }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-mid)' }}>
                  🚗 I have my own vehicle
                </span>
              </label>
              {hasOwnVehicle && (
                <div className="form-group">
                  <label className="form-label">Vehicle Model</label>
                  <input className="form-input" placeholder="e.g. Honda City 2019, Suzuki Alto"
                    value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} />
                </div>
              )}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">License Type</label>
                <select className="form-select" value={licenseType} onChange={e => setLicenseType(e.target.value)}>
                  <option value="">Select license type</option>
                  <option>LTV (Light Transport Vehicle)</option>
                  <option>HTV (Heavy Transport Vehicle)</option>
                  <option>Motorcycle</option>
                  <option>International License</option>
                </select>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-primary" onClick={() => {
              if (!ratePerDay || isNaN(parseFloat(ratePerDay))) { setError('Please enter your daily rate'); return; }
              setError('');
              setStep(4);
            }}>
              Next — Photos →
            </button>
          </div>
          {error && <div style={{ color: '#E11D48', fontSize: 13, marginTop: 10 }}>❌ {error}</div>}
        </div>
      )}

      {/* STEP 4: Work Photos & Review */}
      {step === 4 && (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 20 }}>
            Step 4 of {TOTAL_STEPS} — Work Photos & Review
          </div>

          {/* Work Photos */}
          <div style={{ marginBottom: 24 }}>
            <label className="form-label">Work Photos — Optional (max 4)</label>
            <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 12 }}>
              Profiles with work photos get 3× more responses from clients.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {workPhotos.map((url, i) => (
                <div key={i} style={{ position: 'relative', paddingTop: '100%', borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--border)' }}>
                  <img src={url} alt="work" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => setWorkPhotos(prev => prev.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 11 }}>
                    ✕
                  </button>
                </div>
              ))}
              {workPhotos.length < 4 && (
                <label style={{
                  border: '2px dashed var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  aspectRatio: '1', minHeight: 80, background: uploadingPhoto ? 'var(--surface)' : 'white',
                }}>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  <span style={{ fontSize: 22 }}>{uploadingPhoto ? '⏳' : '📷'}</span>
                  <span style={{ fontSize: 10, color: 'var(--ink-soft)', marginTop: 4 }}>{uploadingPhoto ? 'Uploading…' : 'Add Photo'}</span>
                </label>
              )}
            </div>
          </div>

          {/* Summary Preview */}
          <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
              Profile Preview
            </p>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, var(--green), var(--green-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>
                {CATEGORIES.find(c => c.id === category)?.icon || '👷'}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{user?.name || 'Your Name'}</div>
                <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>{subCategory}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                  📍 {area ? `${area}, ` : ''}{city}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--green)' }}>
                  Rs. {ratePerDay ? parseInt(ratePerDay).toLocaleString() : '—'}<span style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 500 }}>/day</span>
                </div>
                {ratePerHour && <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Rs. {parseInt(ratePerHour).toLocaleString()}/hr</div>}
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {selectedSkills.slice(0, 5).map(s => (
                <span key={s} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: 'white', border: '1px solid var(--border)', color: 'var(--ink-mid)' }}>
                  {s}
                </span>
              ))}
              {selectedSkills.length > 5 && <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>+{selectedSkills.length - 5} more</span>}
            </div>
            {bio && <p style={{ fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.6 }}>{bio.slice(0, 120)}{bio.length > 120 ? '…' : ''}</p>}
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#991B1B', fontSize: 13 }}>
              ❌ {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setStep(3)}>← Back</button>
            <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={isLoading}
              style={{ flex: 1, opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? '⏳ Publishing Profile…' : '🚀 Publish My Profile'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
