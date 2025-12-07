import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Correct import for jwt-decode

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');  // To store the personalized welcome message
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track if user is logged in
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Send login request to the backend
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // On success, store the token in localStorage
      const { token, message } = response.data;
      localStorage.setItem('token', token);

      // Set the personalized welcome message
      setMessage(message);
      setIsLoggedIn(true);  // Set logged in state to true when login is successful

    } catch (error) {
      if (error.response) {
        setError(error.response.data.error || 'Something went wrong!');
      } else {
        setError('Network error. Please try again later.');
      }
    }
  };

  const handleContinue = () => {
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);  // Decode token using jwtDecode

    // Use the decoded role directly to navigate to the respective dashboard
    if (decoded.role === 'admin') {
      navigate('/admin-dashboard');
    } else if (decoded.role === 'doctor') {
      navigate('/doctor-dashboard');
    } else if (decoded.role === 'patient') {
      navigate('/patient-dashboard');
    } else if (decoded.role === 'hospital') {
      navigate('/hospital-dashboard');
    } else if (decoded.role === 'donor') {
      navigate('/donor-dashboard');
    } else {
      navigate('/exercises');  // Default page
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      {!isLoggedIn ? (
        <form onSubmit={handleLogin}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      ) : (
        <div>
          <h3>{message}</h3> {/* Show the personalized message */}
          <button onClick={handleContinue}>Enter</button> {/* Continue to dashboard */}
        </div>
      )}
    </div>
  );
};

export default Login;
