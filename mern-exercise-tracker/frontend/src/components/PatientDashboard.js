// components/PatientDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const appointmentsResponse = await axios.get('/api/patient/appointments');
        const prescriptionsResponse = await axios.get('/api/patient/prescriptions');
        setAppointments(appointmentsResponse.data);
        setPrescriptions(prescriptionsResponse.data);
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };
    fetchPatientData();
  }, []);

  return (
    <div>
      <h1>Patient Dashboard</h1>
      <h3>Your Appointments</h3>
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment._id}>{appointment.doctorName} - {appointment.date}</li>
        ))}
      </ul>
      <h3>Your Prescriptions</h3>
      <ul>
        {prescriptions.map((prescription) => (
          <li key={prescription._id}>{prescription.medicine} - {prescription.date}</li>
        ))}
      </ul>
    </div>
  );
};

export default PatientDashboard;
