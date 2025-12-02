import React, { useEffect, useState } from 'react';

export default function BookAppointment({ api }) {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patientName: '', patientPhone: '', department: '', doctorName: '', appointmentDate: '', appointmentTime: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getDepartments().then(d => setDepartments(d || [])).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (!form.department) return setDoctors([]);
    api.getDoctors(form.department).then(d => setDoctors(d || [])).catch(e => console.error(e));
  }, [form.department]);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const payload = { ...form };
      const res = await api.createAppointment(payload);
      if (res && res.appointmentId) {
        setMessage('Appointment booked: ' + res.appointmentId);
        setForm({ patientName: '', patientPhone: '', department: '', doctorName: '', appointmentDate: '', appointmentTime: '' });
      } else if (res && res.error) {
        setError(res.error);
      } else {
        setError('Unexpected response');
      }
    } catch (err) {
      setError(String(err));
    }
  }

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  return (
    <div>
      <h2>Book Appointment</h2>
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
        <input placeholder="Patient name" value={form.patientName} onChange={e => update('patientName', e.target.value)} required />
        <input placeholder="Phone" value={form.patientPhone} onChange={e => update('patientPhone', e.target.value)} required />

        <select value={form.department} onChange={e => update('department', e.target.value)} required>
          <option value="">Select department</option>
          {departments.map(d => <option key={d._id || d.id} value={d.name || d.department || d._id}>{d.name || d.department}</option>)}
        </select>

        <select value={form.doctorName} onChange={e => update('doctorName', e.target.value)} required>
          <option value="">Select doctor</option>
          {doctors.map(doc => <option key={doc._id || doc.id} value={doc.name || doc.doctorName}>{doc.name || doc.doctorName}</option>)}
        </select>

        <input type="date" value={form.appointmentDate} onChange={e => update('appointmentDate', e.target.value)} required />
        <input type="time" value={form.appointmentTime} onChange={e => update('appointmentTime', e.target.value)} required />

        <div>
          <button type="submit">Book</button>
        </div>
      </form>
    </div>
  );
}
