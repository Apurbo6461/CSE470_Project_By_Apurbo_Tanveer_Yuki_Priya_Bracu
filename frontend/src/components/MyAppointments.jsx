import React, { useState } from 'react';

export default function MyAppointments({ api }) {
  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  async function search(e) {
    e && e.preventDefault();
    setError(null);
    try {
      const res = await api.getAppointments(phone || null);
      setAppointments(res || []);
    } catch (err) {
      setError(String(err));
    }
  }

  async function cancel(id) {
    try {
      await api.cancelAppointment(id);
      setAppointments(a => a.filter(x => (x._id || x.id) !== id));
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <div>
      <h2>My Appointments</h2>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      <form onSubmit={search} style={{ marginBottom: 12 }}>
        <input placeholder="Enter your phone to search" value={phone} onChange={e => setPhone(e.target.value)} />
        <button style={{ marginLeft: 8 }}>Search</button>
      </form>

      <ul>
        {appointments.map(a => (
          <li key={a._id || a.id} style={{ marginBottom: 8 }}>
            <strong>{a.patientName}</strong> with <em>{a.doctorName}</em> on {a.appointmentDate} at {a.appointmentTime}
            <div>Phone: {a.patientPhone}</div>
            <div style={{ marginTop: 6 }}>
              <button onClick={() => cancel(a._id || a.id)}>Cancel</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
