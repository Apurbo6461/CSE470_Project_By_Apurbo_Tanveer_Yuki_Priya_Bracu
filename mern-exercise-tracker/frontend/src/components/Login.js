import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Both email and password are required.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      const { token, role, message } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      alert(message);

      if (role === "admin") navigate("/admin");
      else if (role === "doctor") navigate("/doctor-dashboard");
      else if (role === "patient") navigate("/patient-dashboard");
      else if (role === "donor") navigate("/donor-dashboard");
      else if (role === "hospital") navigate("/hospital-dashboard");
    } catch (err) {
      setError("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Login</h1>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <button type="submit">Login</button>

        {/* 👇 Public access */}
        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate("/blood-donor-request")}
        >
          Blood Donor Request
        </button>
      </form>
    </div>
  );
};

export default Login;
