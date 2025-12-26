import React, { useState } from 'react';

// Backend base — set to your server host/port
const API_BASE = 'http://localhost:5000';

/**
 * RequestForm
 * Props:
 *  - defaultContactName (optional) — e.g. verified patient name from PatientForm
 *  - defaultContactEmail (optional)
 */
export default function RequestForm({ defaultContactName = '', defaultContactEmail = '' }) {
  const [name, setName] = useState(defaultContactName || '');
  const [email, setEmail] = useState(defaultContactEmail || '');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState('medium');
  const [message, setMessage] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatusMsg('');
    setLoading(true);

    const payload = {
      requesterInfo: { name: (name || '').trim(), email: (email || '').trim() },
      bloodGroup,
      units,
      urgency,
      message
    };

    try {
      const res = await fetch(`${API_BASE}/api/blood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('content-type') || '';
      const body = contentType.includes('application/json') ? await res.json() : await res.text();

      if (!res.ok) throw new Error(body?.message || JSON.stringify(body) || res.statusText);

      setStatusMsg('Request submitted. Donors will be able to see it.');
      setMessage('');
    } catch (err) {
      console.error('submit request error', err);
      setStatusMsg('Error: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h4>Request Blood</h4>
      <form onSubmit={handleSubmit}>
        <label>
          Your name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Your email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label>
          Blood group
          <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
            <option>O+</option>
            <option>O-</option>
          </select>
        </label>

        <label>
          Units
          <input type="number" min="1" value={units} onChange={(e) => setUnits(Number(e.target.value) || 1)} />
        </label>

        <label>
          Urgency
          <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>

        <label>
          Message (optional)
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>

        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>{loading ? 'Submitting…' : 'Request Blood'}</button>
        </div>

        {statusMsg && <div style={{ marginTop: 8 }}>{statusMsg}</div>}
      </form>
    </div>
  );
}