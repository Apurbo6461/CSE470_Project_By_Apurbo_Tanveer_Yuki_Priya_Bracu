// components/HospitalDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HospitalDashboard = () => {
  const [admissions, setAdmissions] = useState([]);
  const [emergencyCases, setEmergencyCases] = useState([]);

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const admissionsResponse = await axios.get('/api/hospital/admissions');
        const emergencyResponse = await axios.get('/api/hospital/emergencies');
        setAdmissions(admissionsResponse.data);
        setEmergencyCases(emergencyResponse.data);
      } catch (error) {
        console.error('Error fetching hospital data:', error);
      }
    };
    fetchHospitalData();
  }, []);

  return (
    <div>
      <h1>Hospital Dashboard</h1>
      <h3>Current Admissions</h3>
      <ul>
        {admissions.map((admission) => (
          <li key={admission._id}>{admission.patientName} - {admission.condition}</li>
        ))}
      </ul>
      <h3>Emergency Cases</h3>
      <ul>
        {emergencyCases.map((emergency) => (
          <li key={emergency._id}>Case: {emergency.patientName} - Urgency: {emergency.urgency}</li>
        ))}
      </ul>
    </div>
  );
};

export default HospitalDashboard;
