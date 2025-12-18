import React, { useState } from "react";
import axios from "axios";
import "./BloodDonorRequest.css";

const BloodDonorRequest = () => {
  const [form, setForm] = useState({
    name: "",
    bloodGroup: "",
    location: "",
    contactInfo: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      await axios.post("http://localhost:5000/api/blood", form);
      setSuccess("Blood donor request submitted successfully.");
      setForm({ name: "", bloodGroup: "", location: "", contactInfo: "" });
    } catch {
      setError("Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="donor-page">
      <div className="donor-card">
        <h1>Blood Donor Registration</h1>
        <p className="subtitle">
          Fill in the details below to register as a blood donor
        </p>

        {success && <div className="success-msg">{success}</div>}
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Blood Group</label>
            <input
              type="text"
              name="bloodGroup"
              placeholder="e.g. O+"
              value={form.bloodGroup}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="City / Area"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Information</label>
            <input
              type="text"
              name="contactInfo"
              placeholder="Phone number"
              value={form.contactInfo}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default BloodDonorRequest;
