import React from 'react'
import { createRoot } from 'react-dom/client'
import PatientForm from './PatientForm'
import './styles.css'

function App(){
  return (
    <div style={{ padding: 20 }}>
      <PatientForm />
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
