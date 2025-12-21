import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DonorSearch = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all verified and approved donors when the component mounts
  useEffect(() => {
    fetchVerifiedDonors();
  }, []);

  const fetchVerifiedDonors = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/blood/verified-donors');
      setDonors(response.data);
    } catch (error) {
      console.error('Error fetching donors:', error);
      setError('Error fetching verified donors');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Verified Blood Donors</h2>

      {error && <div style={{ color: 'red', marginBottom: '8px' }}>{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h3>Results ({donors.length})</h3>
          {donors.length === 0 && <p>No verified or approved donors available.</p>}
          {donors.map((donor) => (
            <div key={donor._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <p><strong>Name:</strong> {donor.name}</p>
              <p><strong>Blood Group:</strong> {donor.bloodGroup}</p>
              <p><strong>Location:</strong> {donor.location}</p>
              <p><strong>Contact:</strong> {donor.contactInfo}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonorSearch;
