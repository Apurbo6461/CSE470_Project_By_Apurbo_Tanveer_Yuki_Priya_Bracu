import React, { useState } from 'react'

// Use Vite env var when available, fallback to localhost:5000
const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:5000';

export default function PatientForm() {
  const [form, setForm] = useState({ name: '', sex: 'Male', age: '', phone: '', email: '', address: '' })
  const [files, setFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [msg, setMsg] = useState('')
  const [patient, setPatient] = useState(null)

  function handleChange(e) {
    const { id, value } = e.target
    setForm(prev => ({ ...prev, [id]: value }))
  }

  function handleFileChange(e) {
    const list = Array.from(e.target.files)
    setFiles(list)
    const urls = list.map(f => (f.type.startsWith('image/') ? URL.createObjectURL(f) : null))
    setPreviewUrls(urls)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('sex', form.sex)
    fd.append('age', form.age)
    fd.append('phone', form.phone)
    fd.append('email', form.email)
    fd.append('address', form.address)
    files.forEach(f => fd.append('historyFiles', f))

    // Helper to try fallback ports when a network error occurs (common when default port is in use)
    async function tryPostWithFallback(baseUrl, fd, maxFallback = 5) {
      const url = new URL(baseUrl);
      const hostname = url.hostname;
      const originalPort = Number(url.port) || 80;
      const portsToTry = [originalPort];
      for (let i = 1; i <= maxFallback; i++) portsToTry.push(originalPort + i);

      let lastErr = null;
      for (const p of portsToTry) {
        const target = `${url.protocol}//${hostname}:${p}`.replace(':80', '');
        try {
          const res = await fetch(`${target}/api/patients`, { method: 'POST', body: fd });
          return res;
        } catch (err) {
          lastErr = err;
          // continue to next port
        }
      }
      throw lastErr || new Error('Network error');
    }

    try {
      const res = await tryPostWithFallback(API_BASE, fd);
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok) {
        let errText = res.statusText;
        try {
          if (contentType.includes('application/json')) {
            const errJson = await res.json();
            errText = errJson.error || JSON.stringify(errJson);
          } else {
            errText = await res.text();
          }
        } catch (e) {
          // ignore parse errors
        }
        throw new Error(`Save failed: ${res.status} ${errText}`);
      }
      const data = contentType.includes('application/json') ? await res.json() : null;
      setMsg('Patient Saved Successfully!')
      setPatient(data)
    } catch (err) {
      console.error('Save error:', err)
      setMsg('Error saving patient: ' + (err.message || err))
    }
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
                    <a href={`http://localhost:5001${f.url}`} target="_blank" rel="noreferrer">
                      {f.originalname}
                    </a>
                  </div>
                ))}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
