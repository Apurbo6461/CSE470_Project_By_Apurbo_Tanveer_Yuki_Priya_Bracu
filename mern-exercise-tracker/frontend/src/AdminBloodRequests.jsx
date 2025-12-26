import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000';

export default function AdminBloodRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/blood/admin`);
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Error fetching requests');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/blood-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      await fetchRequests();
    } catch (err) {
      setError(err.message || 'Error updating status');
    }
  }

  if (loading) return <div>Loading requests...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div>
      <h2>Blood Requests (Admin)</h2>
      {requests.length === 0 ? (
        <div>No requests found.</div>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Name</th>
              <th>Blood Group</th>
              <th>Units</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req._id}>
                <td>{req.requesterInfo?.name}</td>
                <td>{req.bloodGroup}</td>
                <td>{req.units}</td>
                <td>{req.urgency}</td>
                <td>{req.status}</td>
                <td>
                  <button onClick={() => updateStatus(req._id, 'verified')} disabled={req.status==='verified'}>Approve</button>
                  <button onClick={() => updateStatus(req._id, 'rejected')} disabled={req.status==='rejected'}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
