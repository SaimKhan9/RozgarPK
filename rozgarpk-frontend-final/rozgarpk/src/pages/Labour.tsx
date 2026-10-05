import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props { showToast: (msg: string) => void; }

const workTypes  = [
  { icon: '🧱', title: 'Mason',          sub: 'Brick & block work'   },
  { icon: '🏗️', title: 'Helper / Labour', sub: 'General labour work'  },
  { icon: '🪣', title: 'Plaster Worker', sub: 'Wall plastering'       },
  { icon: '🪟', title: 'Tile Worker',    sub: 'Floor & wall tiles'    },
  { icon: '🏛️', title: 'Roof Slab',      sub: 'Roof casting'          },
  { icon: '⛏️', title: 'Excavation',     sub: 'Foundation digging'    },
];
const workerCounts = ['1 Worker','2 Workers','3–5 Workers','5–10 Workers','10+ Workers'];
const durations    = ['1 Day','2–3 Days','1 Week','2 Weeks','1 Month','Full Project'];
const payments     = ['💰 Per Worker / Day','📦 Full Contract','📅 Weekly'];
const materials    = ['🏠 I (Client) Will Provide','👷 Worker Will Bring','🤝 We Share'];

const rateRows = [
  { type: '🧱 Mason (Brick)',   skilled: 'Rs. 2,000–2,500', helper: 'Rs. 1,200–1,500', note: 'Materials separate'   },
  { type: '🪣 Plaster Worker',  skilled: 'Rs. 2,500–3,000', helper: 'Rs. 1,200–1,500', note: '1 room per day'       },
  { type: '🪟 Tile Worker',     skilled: 'Rs. 3,000–4,000', helper: 'Rs. 1,500',        note: 'Client supplies tiles'},
  { type: '🏛️ Roof Slab',       skilled: 'Rs. 2,500',       helper: 'Rs. 1,500',        note: 'Team required'       },
  { type: '⛏️ Excavation',      skilled: '—',               helper: 'Rs. 1,000–1,500',  note: 'Also per cubic ft'   },
  { type: '🏗️ General Labour',  skilled: '—',               helper: 'Rs. 1,000–1,200',  note: 'Any general work'    },
];

const workers = [
  { avatar:'🧱', name:'Shahid — Mason',      skill:'Mason & Construction', rating:4.9, reviews:73,
    badge:'🧱 Mason', badgeBg:'var(--green-pale)', badgeColor:'var(--green)',
    tags:['Brick Work','Plaster','Block Wall','Team: 4 people'],
    loc:'G-13, Islamabad · 10 yrs',
    rates:[['Mason (Per Day)','Rs. 2,200'],['Helper (Per Day)','Rs. 1,300'],['Team of 4 (Per Day)','Rs. 7,000']],
    tip:'💡 Team available — Mason + 3 helpers. Ideal for large projects.', tipBg:'#fff8e1',
    rateMain:'Rs. 2,200/day', rateSub:'Materials separate',
  },
  { avatar:'🪟', name:'Naveed — Tile Worker', skill:'Tile & Marble Work', rating:4.2, reviews:49,
    badge:'🪟 Tile Worker', badgeBg:'var(--amber-light)', badgeColor:'#92400E',
    tags:['Floor Tiles','Wall Tiles','Marble','Bathroom'],
    loc:'Lahore · 7 yrs',
    rates:[['Per Day','Rs. 3,500'],['Per Sq. Ft (Floor)','Rs. 35–45'],['Full Bathroom','Rs. 8,000–12,000']],
    tip:'', tipBg:'',
    rateMain:'Rs. 3,500/day', rateSub:'Or per sq. ft',
  },
  { avatar:'🪣', name:'Zafar — Plaster',      skill:'Plaster & POP Work', rating:4.9, reviews:58,
    badge:'🪣 Plaster', badgeBg:'var(--green-pale)', badgeColor:'var(--green)',
    tags:['Wall Plaster','POP Ceiling','Putty','Texture'],
    loc:'Rawalpindi · 9 yrs',
    rates:[['Per Day','Rs. 2,800'],['Per Sq. Ft','Rs. 20–30'],['1 Room (Complete)','Rs. 4,000–6,000']],
    tip:'', tipBg:'',
    rateMain:'Rs. 2,800/day', rateSub:'Helper separate',
  },
  { avatar:'🏗️', name:'Munir — Contractor',   skill:'Labour Contractor', rating:4.3, reviews:34,
    badge:'🏗️ Contractor', badgeBg:'var(--purple-pale)', badgeColor:'var(--purple)',
    tags:['5–20 Workers','Roof Slab','Foundation','Site Work'],
    loc:'Islamabad · 15 yrs',
    rates:[['Per Worker / Day','Rs. 1,100'],['5 Workers / Day','Rs. 5,500'],['10 Workers / Day','Rs. 10,000']],
    tip:'💡 Contractor — Sends full teams for large construction projects.', tipBg:'var(--purple-pale)',
    rateMain:'Rs. 1,100/worker', rateSub:'Min 5 workers',
  },
];

export default function Labour({ showToast }: Props) {
  const navigate = useNavigate();
  const [workType,    setWorkType]    = useState('Mason');
  const [workerCount, setWorkerCount] = useState('1 Worker');
  const [duration,    setDuration]    = useState('1 Day');
  const [payment,     setPayment]     = useState('💰 Per Worker / Day');
  const [material,    setMaterial]    = useState('🏠 I (Client) Will Provide');

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#3d1f00,#7a3e00)',
        borderRadius: 14, padding: 28, marginBottom: 24, color: 'white',
      }}>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>👷 Daily Labour & Construction</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Hire Construction Workers for Your Home or Project</div>
        <div style={{ fontSize: 14, opacity: 0.8 }}>Mason, Helper, Plaster, Tiles, Roof Slab — everything covered. From 1 day to full project.</div>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        {/* Work Type */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
          Select Type of Work
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, marginBottom: 20 }}>
          {workTypes.map(w => (
            <div key={w.title} onClick={() => setWorkType(w.title)} style={{
              border: `2px solid ${workType === w.title ? 'var(--green)' : 'var(--border)'}`,
              background: workType === w.title ? 'var(--green-pale)' : 'white',
              borderRadius: 10, padding: 14, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{w.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{w.title}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{w.sub}</div>
            </div>
          ))}
        </div>

        {/* Workers Count */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 10 }}>How Many Workers Needed?</p>
        <div className="toggle-group" style={{ marginBottom: 18 }}>
          {workerCounts.map(c => (
            <button key={c} className={`toggle-pill ${workerCount === c ? 'active' : ''}`} onClick={() => setWorkerCount(c)}>{c}</button>
          ))}
        </div>

        {/* Duration */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 10 }}>How Many Days of Work?</p>
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

        {/* Material */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 10 }}>Who Provides Materials?</p>
        <div className="toggle-group" style={{ marginBottom: 18 }}>
          {materials.map(m => (
            <button key={m} className={`toggle-pill ${material === m ? 'active' : ''}`} onClick={() => setMaterial(m)}>{m}</button>
          ))}
        </div>

        {/* Budget + City */}
        <div className="form-row" style={{ marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Budget Per Worker (Rs.)</label>
            <input type="number" className="form-input" placeholder="e.g. 1500" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">City</label>
            <select className="form-select">
              {['Islamabad','Karachi','Lahore','Rawalpindi','Peshawar'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">Describe the Work</label>
          <textarea className="form-textarea"
            placeholder="e.g. Need to pour roof slab for 3 rooms, single storey. I will provide all materials. Work to start at 8 AM." />
        </div>

        {/* Urgent */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 18 }}>
          <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--amber)' }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-mid)' }}>⚡ Urgent — Need workers today or tomorrow</span>
        </label>

        <button className="btn btn-primary btn-full btn-lg"
          onClick={() => showToast('✅ Construction job posted! Workers will send proposals.')}>
          👷 Find Workers
        </button>
      </div>

      {/* Rate Guide */}
      <div className="card" style={{ padding: 22, marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>
          📊 Market Rate Guide (Islamabad / Rawalpindi)
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface)' }}>
                {['Work Type','Per Day (Skilled)','Per Day (Helper)','Note'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--ink-soft)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rateRows.map(row => (
                <tr key={row.type} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{row.type}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--green)' }}>{row.skilled}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--ink-mid)' }}>{row.helper}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--ink-soft)' }}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Workers */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>
        Available Construction Workers (42)
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {workers.map((w, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg,var(--green),var(--green-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>{w.avatar}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{w.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>{w.skill}</div>
                  <div className="stars">{'★'.repeat(Math.round(w.rating))}<span style={{ fontSize: 11, color: 'var(--ink-soft)', marginLeft: 4 }}>({w.reviews})</span></div>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: w.badgeBg, color: w.badgeColor, whiteSpace: 'nowrap' }}>
                {w.badge}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {w.tags.map(t => (
                <span key={t} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink-mid)' }}>{t}</span>
              ))}
            </div>

            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 10 }}>📍 {w.loc}</div>

            <div style={{ background: 'var(--surface)', borderRadius: 8, padding: 10, marginBottom: 10 }}>
              {w.rates.map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: 'var(--ink-mid)' }}>{label}:</span>
                  <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{val}</span>
                </div>
              ))}
            </div>

            {w.tip && (
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', background: w.tipBg, borderRadius: 6, padding: 8, marginBottom: 10 }}>
                {w.tip}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1.5px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{w.rateMain}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{w.rateSub}</div>
              </div>
              <button className="btn btn-amber btn-sm" onClick={() => navigate('/chat')}>Hire Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
