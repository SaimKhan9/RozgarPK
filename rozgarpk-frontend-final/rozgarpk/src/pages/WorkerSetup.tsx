export default function WorkerSetupPage() {
  return (
    <div className="container" style={{ maxWidth: 720, paddingTop: 32, paddingBottom: 60 }}>
      <div className="card" style={{ padding: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, marginBottom: 8 }}>Worker profile setup</h1>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>Complete your profile to start receiving job opportunities.</p>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select">
              <option>Home Services</option>
              <option>Electronics</option>
              <option>Education</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Sub category</label>
            <select className="form-select">
              <option>Plumber</option>
              <option>Electrician</option>
              <option>Carpenter</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Skills</label>
          <input className="form-input" placeholder="Pipe repair, wiring, painting" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Rate / day</label>
            <input className="form-input" type="number" placeholder="1500" />
          </div>
          <div className="form-group">
            <label className="form-label">Experience years</label>
            <input className="form-input" type="number" placeholder="3" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-textarea" placeholder="Tell clients about your experience and strengths" />
        </div>

        <button className="btn btn-primary btn-full" type="button">Save profile</button>
      </div>
    </div>
  );
}
