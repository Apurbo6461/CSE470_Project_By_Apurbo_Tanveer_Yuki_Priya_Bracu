import React, { useEffect, useState } from 'react'

// Backend base (ensure it matches your server port)
const API_BASE = 'http://localhost:5000';

export default function DonorSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function isVerified() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user && user.role === 'patient') return true;
    } catch (e) { /* ignore */ }

    if (sessionStorage.getItem('verify_token')) return true;
    if (sessionStorage.getItem('verified_patient')) return true;
    return false;
  }

  useEffect(() => {
    if (!isVerified()) return;
    fetchDonors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchDonors() {
    setError('');
    setLoading(true);
    setResults([]);

    const verifyToken = sessionStorage.getItem('verify_token');
    const headers = verifyToken ? { Authorization: `Bearer ${verifyToken}` } : {};

    try {
      const res = await fetch(`${API_BASE}/api/blood/search`, { method: 'GET', headers });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Not authorized to view donors');
        }
        const txt = await res.text().catch(() => null);
        throw new Error(`Server error: ${res.status} ${txt || ''}`);
      }
      const data = await res.json().catch(() => null);
      const items = Array.isArray(data) ? data : (data?.results || data || []);
      setResults(items);
    } catch (err) {
      console.error('fetchDonors error', err);
      setError(err.message || 'Failed to load donors');
    } finally {
      setLoading(false);
    }
  }

  if (!isVerified()) {
    return (
      <div>
        <div style={{ color: '#666', marginBottom: 8 }}>
          Please verify as the patient (or login as a patient) to view verified blood donors.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 'bold', color: 'green' }}>Showing verified donors</div>
        <button onClick={fetchDonors} disabled={loading} style={{ marginLeft: 8 }}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      <ul style={{ paddingLeft: 18 }}>
        {results.map((d) => (
          <li key={d._id || d.id || `${d.name}-${Math.random()}`} style={{ marginBottom: 10 }}>
            <div>
              <strong>{d.name}</strong> — {d.bloodGroup} {d.available === false && <span style={{ color: 'orange' }}>(not available)</span>}
            </div>
            <div>Contact: {d.contactInfo || d.phone || 'N/A'}</div>
            <div>
              Location: {d.location?.address || d.locationText || (d.location?.coordinates ? `${d.location.coordinates[1]?.toFixed(4)}, ${d.location.coordinates[0]?.toFixed(4)}` : 'N/A')}
            </div>
            {typeof d.distance === 'number' && <div>Distance: {(d.distance / 1000).toFixed(2)} km</div>}
          </li>
        ))}
      </ul>

      {!loading && results.length === 0 && <div style={{ color: '#666' }}>No verified donors available.</div>}
    </div>
  );
}