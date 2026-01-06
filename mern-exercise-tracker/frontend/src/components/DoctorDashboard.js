// components/DoctorDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const appointmentsResponse = await axios.get('/api/doctor/appointments');
        const patientsResponse = await axios.get('/api/doctor/patients');
        setAppointments(appointmentsResponse.data);
        setPatients(patientsResponse.data);
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      }
    };
    fetchDoctorData();
  }, []);

  return (
    <div>
      <h1>Doctor Dashboard</h1>
      <h3>Your Appointments</h3>
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment._id}>{appointment.patientName} - {appointment.date}</li>
        ))}
      </ul>
      <h3>Your Patients</h3>
      <ul>
        {patients.map((patient) => (
          <li key={patient._id}>{patient.name} - {patient.diagnosis}</li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorDashboard;
