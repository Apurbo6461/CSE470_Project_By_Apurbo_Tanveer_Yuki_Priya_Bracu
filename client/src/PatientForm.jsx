import React, { useState } from 'react'

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

    try {
      const res = await fetch('/api/patients', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      setMsg('Patient Saved Successfully!')
      setPatient(data)
    } catch (err) {
      console.error(err)
      setMsg('Error saving patient')
    }
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <img src="https://cdn-icons-png.flaticon.com/512/2967/2967350.png" alt="logo" style={{ width: 70, opacity: 0.9 }} />
      </div>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="https://cdn-icons-png.flaticon.com/512/2967/2967350.png" style={{ width: 22 }} />
        Patient Profile
      </h3>
      <form onSubmit={handleSubmit} id="patientForm">
        <label>Patient Name
          <input id="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>Sex
          <select id="sex" value={form.sex} onChange={handleChange}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </label>
        <label>Age
          <input type="number" id="age" value={form.age} onChange={handleChange} />
        </label>
        <label>Phone
          <input id="phone" value={form.phone} onChange={handleChange} />
        </label>
        <label>Email
          <input type="email" id="email" value={form.email} onChange={handleChange} />
        </label>
        <label>Address
          <textarea id="address" value={form.address} onChange={handleChange}></textarea>
        </label>

        <label>Attach Previous Medical History (Images / PDFs)</label>
        <input type="file" id="historyFiles" multiple onChange={handleFileChange} />
        <div className="preview-grid">
          {previewUrls.map((u, i) => u ? <img key={i} src={u} alt="preview" /> : <div key={i} className="file-pill">{files[i].name}</div>)}
        </div>

        <button type="submit">Save Patient</button>
      </form>

      <p style={{ color: 'green', marginTop: 10 }}>{msg}</p>

      {patient && (
        <div className="patient-details" style={{ marginTop: 20 }}>
          <h4>Patient Details</h4>
          <p><strong>ID:</strong> {patient.patientId}</p>
          <p><strong>Name:</strong> {patient.name}</p>
          <p><strong>Sex:</strong> {patient.sex}</p>
          <p><strong>Age:</strong> {patient.age}</p>
          <p><strong>Phone:</strong> {patient.phone}</p>
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>Address:</strong> {patient.address}</p>
          <p><strong>Medical History Files:</strong> {patient.files && patient.files.map(f => <div key={f.filename}><a href={f.url} target="_blank" rel="noreferrer">{f.originalname}</a></div>)}</p>
        </div>
      )}
    </div>
  )
}
