import { useState } from "react";
import { createDoctor } from "../api/doctorApi";

export default function CreateDoctor() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    specialization: "",
    credentials: "",
    availability: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const availabilityArray = form.availability.split(","); // comma separated
    await createDoctor({ ...form, availability: availabilityArray });
    alert("Doctor profile created!");
    setForm({ name: "", email: "", specialization: "", credentials: "", availability: "" });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} required />
      <input name="credentials" placeholder="Credentials" value={form.credentials} onChange={handleChange} required />
      <input name="availability" placeholder="Availability (comma separated)" value={form.availability} onChange={handleChange} />
      <button type="submit">Create Doctor</button>
    </form>
  );
}