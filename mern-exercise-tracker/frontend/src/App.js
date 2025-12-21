import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import BloodDonorRequest from "./components/BloodDonorRequest";
import AdminDashboard from "./components/AdminDashboard";
import PatientForm from "./PatientForm.jsx";import DonorSearch from "./components/DonorSearch";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default → Login */}
        <Route path="/" element={<Login />} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Admin page */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/blood-donor-request" element={<BloodDonorRequest />} />
        <Route path="/patient-form" element={<PatientForm />} />
        <Route path="/donor-search" element={<DonorSearch />} />


        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
