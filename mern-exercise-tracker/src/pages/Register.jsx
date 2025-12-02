import React, { useState } from "react";
import axios from "axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/register", {
        name,
        email,
        password,
        role: "patient",
      });
      alert("Registered Successfully");
      console.log(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error registering");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
      <button type="submit">Register</button>
    </form>
  );
}
