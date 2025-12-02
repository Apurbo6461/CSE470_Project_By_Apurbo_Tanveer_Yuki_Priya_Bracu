const API_BASE_URL = 'http://localhost:5001/api';

export const apiService = {
  // Departments
  async getDepartments() {
    const res = await fetch(`${API_BASE_URL}/departments`);
    return res.json();
  },

  // Doctors
  async getDoctors(department = null) {
    const url = department 
      ? `${API_BASE_URL}/doctors?department=${department}`
      : `${API_BASE_URL}/doctors`;
    const res = await fetch(url);
    return res.json();
  },

  async getDoctorById(id) {
    const res = await fetch(`${API_BASE_URL}/doctors/${id}`);
    return res.json();
  },

  // Appointments
  async createAppointment(appointmentData) {
    const res = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });
    return res.json();
  },

  async getAppointments(patientPhone = null) {
    const url = patientPhone
      ? `${API_BASE_URL}/appointments?patientPhone=${patientPhone}`
      : `${API_BASE_URL}/appointments`;
    const res = await fetch(url);
    return res.json();
  },

  async getAppointmentById(id) {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}`);
    return res.json();
  },

  async updateAppointment(id, updateData) {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    return res.json();
  },

  async cancelAppointment(id) {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async checkSlotAvailability(doctorName, appointmentDate, appointmentTime) {
    const res = await fetch(
      `${API_BASE_URL}/appointments/check-availability?doctorName=${doctorName}&appointmentDate=${appointmentDate}&appointmentTime=${appointmentTime}`
    );
    return res.json();
  }
};
