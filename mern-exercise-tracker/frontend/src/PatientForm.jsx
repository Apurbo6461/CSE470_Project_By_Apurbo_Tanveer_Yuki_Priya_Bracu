import React, { useState, useEffect } from 'react'
import DonorSearch from './DonorSearch'
import RequestForm from './RequestForm'

// Backend base (server.log shows server running on port 5000)
const API_BASE = 'http://localhost:5000';

export default function PatientForm() {
  const [form, setForm] = useState({ name: '', sex: 'Male', age: '', phone: '', email: '', address: '' })
  const [files, setFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [msg, setMsg] = useState('')
  const [patient, setPatient] = useState(null)

  // Verification UI state
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyName, setVerifyName] = useState('')
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [verifiedPatient, setVerifiedPatient] = useState(null)

  useEffect(() => {
    // restore verified session if any
    try {
      const stored = sessionStorage.getItem('verified_patient')
      if (stored) setVerifiedPatient(JSON.parse(stored))
    } catch (e) { /* ignore */ }
  }, [])

  function handleChange(e) {
    const { id, value } = e.target
    setForm(prev => ({ ...prev, [id]: value }))
  }

  function handleFileChange(e) {
    const list = Array.from(e.target.files || [])
    setFiles(list)
    const urls = list.map(f => (f.type && f.type.startsWith('image/') ? URL.createObjectURL(f) : null))
    setPreviewUrls(urls)
  }

  async function postPatient(fd) {
    const endpoint = `${API_BASE}/api/patients`
    console.log('Posting patient to', endpoint)
    try {
      const res = await fetch(endpoint, { method: 'POST', body: fd })
      return res
    } catch (err) {
      console.error('Network/fetch error posting patient to', endpoint, err)
      throw err
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg('')
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('sex', form.sex)
    fd.append('age', form.age)
    fd.append('phone', form.phone)
    fd.append('email', form.email)
    fd.append('address', form.address)
    files.forEach(f => fd.append('historyFiles', f))

    try {
      const res = await postPatient(fd)
      if (!res) throw new Error('No response from server')
      const contentType = res.headers.get('content-type') || ''
      const body = contentType.includes('application/json') ? await res.json() : await res.text()

      if (!res.ok) {
        throw new Error(`Save failed: ${res.status} ${typeof body === 'string' ? body : JSON.stringify(body)}`)
      }

      const data = contentType.includes('application/json') ? body : null
      setMsg('Patient Saved Successfully!')
      setPatient(data)
      if (data) {
        try {
          sessionStorage.setItem('verified_patient', JSON.stringify(data))
          setVerifiedPatient(data)
        } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.error('Save error:', err)
      setMsg('Error saving patient: ' + (err.message || err))
    }
  }

  // submit verify via modal (stores verify_token too)
  async function submitVerify(e) {
    e && e.preventDefault()
    setVerifyError('')
    if (!verifyName.trim() || !verifyEmail.trim()) {
      setVerifyError('Please provide name and email')
      return
    }
    setVerifying(true)
    try {
      const endpoint = `${API_BASE}/api/patients/verify-requester`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: verifyName.trim(), email: verifyEmail.trim().toLowerCase() })
      })
      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await res.json() : null

      if (!res.ok) {
        throw new Error(data?.message || JSON.stringify(data) || res.statusText)
      }

      if (data && data.ok && data.patient) {
        setVerifiedPatient(data.patient)
        try {
          sessionStorage.setItem('verified_patient', JSON.stringify(data.patient))
          if (data.token) {
            sessionStorage.setItem('verify_token', data.token)
            console.log('verify_token stored (short-lived):', data.token)
          }
        } catch (e) { /* ignore */ }
        setShowVerifyModal(false)
      } else {
        throw new Error(data?.message || 'Verification failed')
      }
    } catch (err) {
      console.error('Verify error', err)
      setVerifyError(err.message || 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  function openVerify() {
    setVerifyError('')
    setVerifyName('')
    setVerifyEmail('')
    setShowVerifyModal(true)
  }

  function clearVerification() {
    setVerifiedPatient(null)
    try {
      sessionStorage.removeItem('verified_patient')
      sessionStorage.removeItem('verify_token')
    } catch (e) {}
  }

  return (
    <div className="app-container">
      <div className="header">
        <div className="logo-container">
          <img src="https://cdn-icons-png.flaticon.com/512/2967/2967350.png" alt="logo" />
        </div>
        <h1>Patient Management System</h1>
        <p>Manage patient records and medical history</p>
      </div>

      <div className="card">
        <h3 className="card-title">
          <img src="https://cdn-icons-png.flaticon.com/512/2967/2967350.png" alt="icon" />
          Patient Registration Form
        </h3>
        <form onSubmit={handleSubmit} id="patientForm">
          <div className="form-row">
            <label>
              Patient Name *
              <input
                id="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter patient full name"
                required
              />
            </label>
            <label>
              Sex
              <select id="sex" value={form.sex} onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Age
              <input
                type="number"
                id="age"
                value={form.age}
                onChange={handleChange}
                placeholder="Enter age"
                min="0"
                max="150"
              />
            </label>
            <label>
              Phone
              <input
                id="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                type="tel"
              />
            </label>
          </div>

          <label>
            Email
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
          </label>

          <label>
            Address
            <textarea
              id="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter full address"
            ></textarea>
          </label>

          <div className="file-upload-section">
            <label>
              Attach Previous Medical History (Images / PDFs)
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="historyFiles"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />
              </div>
            </label>
            {previewUrls.length > 0 && (
              <div className="preview-grid">
                {previewUrls.map((u, i) =>
                  u ? (
                    <img key={i} src={u} alt="preview" />
                  ) : (
                    <div key={i} className="file-pill">{files[i].name}</div>
                  )
                )}
              </div>
            )}
          </div>

          <button type="submit">Save Patient</button>
        </form>

        {msg && (
          <div className={`message ${msg.includes('Error') ? 'error' : 'success'}`}>
            {msg}
          </div>
        )}
      </div>

      {patient && (
        <div className="card">
          <div className="patient-details">
            <h4>Patient Details</h4>
            <p><strong>ID:</strong> {patient.patientId}</p>
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Sex:</strong> {patient.sex}</p>
            {patient.age && <p><strong>Age:</strong> {patient.age}</p>}
            {patient.phone && <p><strong>Phone:</strong> {patient.phone}</p>}
            {patient.email && <p><strong>Email:</strong> {patient.email}</p>}
            {patient.address && <p><strong>Address:</strong> {patient.address}</p>}
            {patient.files && patient.files.length > 0 && (
              <p>
                <strong>Medical History Files:</strong>
                {patient.files.map(f => (
                  <div key={f.filename}>
                    <a href={`${API_BASE}${f.url}`} target="_blank" rel="noreferrer">
                      {f.originalname}
                    </a>
                  </div>
                ))}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Blood Donor</h3>

        {!verifiedPatient ? (
          <div>
            <p style={{ color: '#666' }}>To search donors and make requests, verify as the patient or register first.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={openVerify}>Verify (name & email)</button>
              {patient && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const endpoint = `${API_BASE}/api/patients/verify-requester`
                      const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: patient.name, email: (patient.email || '').toLowerCase() })
                      });
                      const contentType = res.headers.get('content-type') || ''
                      const data = contentType.includes('application/json') ? await res.json() : null
                      if (!res.ok) throw new Error(data?.message || JSON.stringify(data) || res.statusText)
                      if (data && data.ok && data.patient) {
                        try {
                          sessionStorage.setItem('verified_patient', JSON.stringify(data.patient))
                          if (data.token) sessionStorage.setItem('verify_token', data.token)
                          setVerifiedPatient(data.patient)
                        } catch (e) {}
                      } else {
                        throw new Error(data?.message || 'Auto-verify failed')
                      }
                    } catch (err) {
                      console.error('Auto-verify error', err)
                      alert('Auto-verify failed: ' + (err.message || err))
                    }
                  }}
                >
                  Use This Patient (auto-verify)
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: 'green', margin: 0 }}>Verified as: <strong>{verifiedPatient.name}</strong> ({verifiedPatient.email})</p>
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={clearVerification}>End Verified Session</button>
            </div>

            <hr />

            <h4>Search Donors</h4>
            <DonorSearch />

            <hr />

            <h4>Request Blood</h4>
            <RequestForm defaultContactName={verifiedPatient.name} defaultContactEmail={verifiedPatient.email} />
          </div>
        )}

        {showVerifyModal && (
          <div style={{
            position: 'fixed',
            left: 0, top: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{ background: '#fff', padding: 20, maxWidth: 440, width: '92%', borderRadius: 6 }}>
              <h3 style={{ marginTop: 0 }}>Verify Patient</h3>
              <form onSubmit={submitVerify}>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 13 }}>Full name</label>
                  <input
                    value={verifyName}
                    onChange={(e) => setVerifyName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 13 }}>Email</label>
                  <input
                    value={verifyEmail}
                    onChange={(e) => setVerifyEmail(e.target.value)}
                    type="email"
                    required
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>

                {verifyError && <div style={{ color: 'red', marginBottom: 10 }}>{verifyError}</div>}

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowVerifyModal(false)} disabled={verifying}>Cancel</button>
                  <button type="submit" disabled={verifying}>
                    {verifying ? 'Verifying…' : 'Verify'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}