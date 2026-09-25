import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = (import.meta.env.VITE_API_URL || 'https://ram-db.onrender.com')
  .trim()
  .replace(/\/+$/, '')

const companies = [
  { name: 'Google', color: '#4285f4', mark: 'G' },
  { name: 'Microsoft', color: '#00a4ef', mark: 'M' },
  { name: 'TCS', color: '#2457a6', mark: 'T' },
  { name: 'Infosys', color: '#007cc3', mark: 'I' },
  { name: 'Wipro', color: '#7b2cbf', mark: 'W' },
  { name: 'HCLTech', color: '#0b7ac3', mark: 'H' },
  { name: 'Amazon', color: '#ff9900', mark: 'a' },
  { name: 'Accenture', color: '#a100ff', mark: 'A' },
  { name: 'Deloitte', color: '#86bc25', mark: 'D' },
  { name: 'Capgemini', color: '#0070ad', mark: 'C' },
]

const initialForm = {
  name: '',
  dateOfBirth: '',
  bloodGroup: '',
  phone: '',
  email: '',
  address: '',
  department: '',
  gender: '',
  year: '',
  section: '',
  arrears: '',
}

function App() {
  const [view, setView] = useState('register')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [preferences, setPreferences] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/registrations`)
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Failed to load registrations')
        setRegistrations(payload)
      })
      .catch((loadError) => {
        setError(loadError.message)
      })
  }, [])

  const companyCounts = useMemo(
    () =>
      companies.map((company) => ({
        ...company,
        count: registrations.filter((student) =>
          student.companies.includes(company.name),
        ).length,
      })),
    [registrations],
  )

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const continueToCompanies = (event) => {
    event.preventDefault()
    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity()
      return
    }
    if (Number(form.arrears) !== 0) {
      setError('Students must have zero arrears to continue to company preferences.')
      return
    }
    setStep(2)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleCompany = (companyName) => {
    setPreferences((current) =>
      current.includes(companyName)
        ? current.filter((name) => name !== companyName)
        : current.length < 4
          ? [...current, companyName]
          : current,
    )
    setError('')
  }

  const submitRegistration = async (event) => {
    event.preventDefault()
    if (preferences.length !== 4) {
      setError('Please choose exactly four companies to submit your registration.')
      return
    }
    const registration = {
      ...form,
      arrears: Number(form.arrears),
      companies: preferences,
      id: `REG-${Date.now().toString().slice(-6)}`,
      registeredAt: new Date().toISOString(),
    }
    setIsSubmitting(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registration),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Failed to save registration')
      setRegistrations((current) => [...current, payload])
      setSubmitted(true)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const startNewRegistration = () => {
    setForm(initialForm)
    setPreferences([])
    setStep(1)
    setSubmitted(false)
    setError('')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" onClick={() => setView('register')} role="button" tabIndex="0">
          <div className="brand-mark">CP</div>
          <div>
            <strong>Campus<span>Path</span></strong>
            <small>PLACEMENT REGISTRATION</small>
          </div>
        </div>
        <nav className="nav-tabs" aria-label="Main navigation">
          <button className={view === 'register' ? 'active' : ''} onClick={() => setView('register')}>
            <span>＋</span> Student registration
          </button>
          <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>
            <span>▦</span> Admin dashboard
            <b>{registrations.length}</b>
          </button>
        </nav>
        <div className="secure-label"><span className="status-dot" /> Secure portal</div>
      </header>

      {view === 'register' ? (
        <main className="page-content">
          {!submitted ? (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">ACADEMIC YEAR 2025–26</p>
                  <h1>Student registration</h1>
                  <p className="subtitle">Enter your details to participate in campus placements.</p>
                </div>
                <div className="step-indicator">
                  <div className={`step ${step === 1 ? 'current' : 'complete'}`}><span>{step > 1 ? '✓' : '01'}</span><label>Student details</label></div>
                  <i />
                  <div className={`step ${step === 2 ? 'current' : ''}`}><span>02</span><label>Company preferences</label></div>
                </div>
              </div>

              {step === 1 ? (
                <form className="card registration-form" onSubmit={continueToCompanies}>
                  <div className="card-heading"><div className="heading-icon">01</div><div><h2>Personal & academic details</h2><p>All fields marked with <em>*</em> are required.</p></div></div>
                  <div className="form-section">
                    <h3>Personal information</h3>
                    <div className="form-grid">
                      <label className="field wide"><span>Full name <em>*</em></span><input name="name" value={form.name} onChange={updateField} placeholder="e.g. Aditi Sharma" required /></label>
                      <label className="field"><span>Date of birth <em>*</em></span><input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={updateField} required /></label>
                      <label className="field"><span>Blood group <em>*</em></span><select name="bloodGroup" value={form.bloodGroup} onChange={updateField} required><option value="">Select group</option>{['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map((group) => <option key={group}>{group}</option>)}</select></label>
                      <label className="field"><span>Phone number <em>*</em></span><input type="tel" name="phone" value={form.phone} onChange={updateField} placeholder="+91 98765 43210" pattern="[0-9+ ()-]{10,}" required /></label>
                      <label className="field wide"><span>Email ID <em>*</em></span><input type="email" name="email" value={form.email} onChange={updateField} placeholder="you@college.edu" required /></label>
                      <label className="field full"><span>Address <em>*</em></span><textarea name="address" value={form.address} onChange={updateField} placeholder="Enter your current address" rows="3" required /></label>
                    </div>
                  </div>
                  <div className="form-section academic-section">
                    <h3>Academic information</h3>
                    <div className="form-grid">
                      <label className="field wide"><span>Department of engineering <em>*</em></span><select name="department" value={form.department} onChange={updateField} required><option value="">Select department</option>{['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Electrical & Electronics', 'Mechanical Engineering', 'Civil Engineering'].map((item) => <option key={item}>{item}</option>)}</select></label>
                      <label className="field"><span>Gender <em>*</em></span><select name="gender" value={form.gender} onChange={updateField} required><option value="">Select gender</option><option>Female</option><option>Male</option><option>Prefer not to say</option></select></label>
                      <label className="field"><span>Year <em>*</em></span><select name="year" value={form.year} onChange={updateField} required><option value="">Select year</option><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option></select></label>
                      <label className="field"><span>Section <em>*</em></span><select name="section" value={form.section} onChange={updateField} required><option value="">Select section</option><option>A</option><option>B</option><option>C</option><option>D</option></select></label>
                      <label className="field"><span>Number of arrears <em>*</em></span><input type="number" min="0" max="99" name="arrears" value={form.arrears} onChange={updateField} placeholder="0" required /></label>
                    </div>
                    <div className="arrears-note"><span>✓</span><p><strong>Placement eligibility</strong><br />Students with zero arrears can continue to select their preferred companies.</p></div>
                  </div>
                  {error && <p className="form-error" role="alert">{error}</p>}
                  <div className="form-actions"><span>Step 1 of 2</span><button className="primary-button" type="submit">Continue to companies <span>→</span></button></div>
                </form>
              ) : (
                <form className="card company-card" onSubmit={submitRegistration}>
                  <div className="card-heading"><div className="heading-icon">02</div><div><h2>Choose your companies</h2><p>Select exactly four companies in order of preference.</p></div><strong className="selection-count">{preferences.length}<small>/ 4 selected</small></strong></div>
                  <div className="company-instruction">Your selections will be shared with the placement cell. You can choose up to four companies.</div>
                  <div className="company-grid">{companies.map((company) => <button type="button" className={`company-option ${preferences.includes(company.name) ? 'selected' : ''}`} key={company.name} onClick={() => toggleCompany(company.name)}><span className="company-logo" style={{ backgroundColor: company.color }}>{company.mark}</span><span>{company.name}</span>{preferences.includes(company.name) && <b>✓</b>}</button>)}</div>
                  {error && <p className="form-error" role="alert">{error}</p>}
                  <div className="form-actions"><button className="back-button" type="button" onClick={() => setStep(1)}>← Back to details</button><button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Submit registration'} <span>→</span></button></div>
                </form>
              )}
              <p className="privacy-note">🔒 Your information is securely stored and only accessible to the college placement cell.</p>
            </>
          ) : (
            <section className="success-card card">
              <div className="success-icon">✓</div><p className="eyebrow">REGISTRATION COMPLETE</p><h1>You&apos;re all set, {form.name.split(' ')[0]}!</h1><p>Your student registration and company preferences have been submitted successfully.</p><div className="registration-id">REGISTRATION ID <strong>{registrations[registrations.length - 1]?.id}</strong></div><div className="success-companies"><span>Your preferences</span>{preferences.map((name, index) => <b key={name}><i>{index + 1}</i>{name}</b>)}</div><button className="primary-button" onClick={startNewRegistration}>Register another student <span>→</span></button></section>
          )}
        </main>
      ) : (
        <AdminDashboard registrations={registrations} companyCounts={companyCounts} />
      )}
    </div>
  )
}

function AdminDashboard({ registrations, companyCounts }) {
  const [query, setQuery] = useState('')
  const filtered = registrations.filter((student) => `${student.name} ${student.email} ${student.department}`.toLowerCase().includes(query.toLowerCase()))
  return <main className="page-content admin-page"><div className="page-heading"><div><p className="eyebrow">PLACEMENT CELL • ADMIN</p><h1>Registration overview</h1><p className="subtitle">Track student preferences and plan company-wise placement drives.</p></div><div className="total-stat"><strong>{registrations.length}</strong><span>Total registrations</span></div></div><div className="stats-grid"><div className="stat-card"><span className="stat-icon blue">♙</span><div><strong>{registrations.length}</strong><span>Registered students</span></div></div><div className="stat-card"><span className="stat-icon green">✓</span><div><strong>{registrations.filter((student) => student.arrears === 0).length}</strong><span>Placement eligible</span></div></div><div className="stat-card"><span className="stat-icon purple">◉</span><div><strong>{companies.filter((company) => companyCounts.find((item) => item.name === company.name)?.count > 0).length}</strong><span>Companies selected</span></div></div></div><section className="card company-overview"><div className="section-title"><div><h2>Company-wise preferences</h2><p>See how many students have selected each company.</p></div><span className="live-pill"><i /> Live data</span></div><div className="company-bars">{companyCounts.map((company) => <div className="company-bar" key={company.name}><span className="mini-logo" style={{ backgroundColor: company.color }}>{company.mark}</span><strong>{company.name}</strong><div className="bar-track"><i style={{ width: `${registrations.length ? Math.max((company.count / registrations.length) * 100, company.count ? 4 : 0) : 0}%`, backgroundColor: company.color }} /></div><b>{company.count}</b></div>)}</div></section><section className="card students-table"><div className="section-title"><div><h2>Recent registrations</h2><p>{registrations.length ? 'All student submissions are shown below.' : 'Student submissions will appear here after registration.'}</p></div><div className="search-box">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search students" /></div></div>{filtered.length ? <div className="table-wrap"><table><thead><tr><th>Student</th><th>Department</th><th>Year</th><th>Top preference</th><th>Status</th></tr></thead><tbody>{filtered.map((student) => <tr key={student.id}><td><strong>{student.name}</strong><small>{student.email}</small></td><td>{student.department}</td><td>{student.year} · {student.section}</td><td><span className="table-company"><i style={{ backgroundColor: companies.find((company) => company.name === student.companies[0])?.color }}>{student.companies[0]?.[0]}</i>{student.companies[0]}</span></td><td><span className="eligible-pill">Eligible</span></td></tr>)}</tbody></table></div> : <div className="empty-state"><span>☷</span><h3>No registrations yet</h3><p>Complete the student registration form to populate this dashboard.</p></div>}</section></main>
}

export default App
