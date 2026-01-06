// BloodRequestForm.js (Frontend)
import React, { useState } from 'react';
import axios from 'axios';

const BloodRequestForm = () => {
  const [bloodGroup, setBloodGroup] = useState('');
  const [urgency, setUrgency] = useState('high');
  const [location, setLocation] = useState('');
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
      'http://localhost:5000/api/blood-donors/register',
      { name, bloodGroup, location, contactInfo },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',  // Ensure the body is being sent as JSON
        },
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
      <h2>Blood Request Form</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Blood Group</label>
          <input
            type="text"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Urgency</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            required
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit Request</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default BloodRequestForm;
