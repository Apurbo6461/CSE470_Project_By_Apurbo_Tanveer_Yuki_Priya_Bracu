import React from 'react'
import PatientForm from './PatientForm'

export default function App() {
  return (
    <div style={{ padding: 24, minHeight: '100vh', background: 'linear-gradient(120deg,#d9ecff,#b8d8ff,#d9ecff)' }}>
      <div style={{ maxWidth: 480, margin: 'auto', background: '#fff', padding: 20, borderRadius: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
        <PatientForm />
      </div>
    </div>
  )
}
