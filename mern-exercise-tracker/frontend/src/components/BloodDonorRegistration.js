import React, { useState } from 'react';
import axios from 'axios';

const BloodDonorRequestForm = () => {
  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please login to submit a blood donor request.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/blood-donors/register', // Endpoint for blood donor registration
        { name, bloodGroup, location, contactInfo },
        {
          headers: { Authorization: `Bearer ${token}` }, // Send JWT token in header
        }
      );

      setMessage('Blood donor request submitted successfully!');
      setName('');
      setBloodGroup('');
      setLocation('');
      setContactInfo('');
    } catch (error) {
      console.error('Error submitting blood donor request:', error);
      setMessage('Error submitting request. Please try again.');
    }
  };

  return (
    <div>
      <h2>Register as a Blood Donor</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Blood Group:</label>
          <input
            type="text"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contact Info:</label>
          <input
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit Request</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default BloodDonorRequestForm;
