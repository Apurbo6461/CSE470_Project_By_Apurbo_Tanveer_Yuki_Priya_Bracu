import React, { useState } from "react";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [response, setResponse] = useState("");

  async function login() {
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.token) {
        setToken(data.token);
        setRole(data.role);
        setResponse(`Login Successful — Role: ${data.role}`);
      } else {
        setResponse("Login Failed: " + data.error);
      }
    } catch (err) {
      setResponse("Error connecting to backend");
    }
  }

  async function callProtected(route) {
    if (!token) return setResponse("Please login first!");

    const res = await fetch(`http://localhost:5000/api/${route}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    setResponse(text);
  }

  return (
    <div className="app-container">
      <h1>Multi-Role User System</h1>

      {/* Login Card */}
      <div className="login-card">
        <h2>Login</h2>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button className="login-btn" onClick={login}>Login</button>
      </div>

      {/* Role Buttons */}
      {token && (
        <div className="login-card">
          <h3>Welcome {role}!</h3>
          <button className="role-btn" onClick={() => callProtected("admin-only")}>Admin</button>
          <button className="role-btn" onClick={() => callProtected("doctor-data")}>Doctor</button>
          <button className="role-btn" onClick={() => callProtected("patient-info")}>Patient</button>
          <button className="role-btn" onClick={() => callProtected("hospital-dashboard")}>Hospital</button>
          <button className="role-btn" onClick={() => callProtected("donor-info")}>Donor</button>
        </div>
      )}

      {/* Response */}
      <div className="response-box">{response}</div>
    </div>
  );
}

export default App;
