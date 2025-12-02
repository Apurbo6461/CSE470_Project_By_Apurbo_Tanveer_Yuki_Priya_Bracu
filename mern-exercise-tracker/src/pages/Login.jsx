import React, { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      alert("Login Successful");
      console.log(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error logging in");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
      <button type="submit">Login</button>
    </form>
  );
}
