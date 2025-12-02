import React, { useEffect, useState } from 'react';
import { apiService } from './services/apiService';
import BookAppointment from './components/BookAppointment';
import MyAppointments from './components/MyAppointments';

export default function App() {
  const [tab, setTab] = useState('book');

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Hospital Appointments</h1>
        <nav>
          <button onClick={() => setTab('book')} style={{ marginRight: 8 }}>Book Appointment</button>
          <button onClick={() => setTab('my')}>My Appointments</button>
        </nav>
      </header>

      <main style={{ marginTop: 20 }}>
        {tab === 'book' && <BookAppointment api={apiService} />}
        {tab === 'my' && <MyAppointments api={apiService} />}
      </main>
    </div>
  );
}
