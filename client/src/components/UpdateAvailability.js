import { useState } from "react";
import { updateAvailability } from "../api/doctorApi";

export default function UpdateAvailability() {
  const [id, setId] = useState("");
  const [availability, setAvailability] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const availabilityArray = availability.split(",");
    await updateAvailability(id, { availability: availabilityArray });
    alert("Availability updated!");
    setId("");
    setAvailability("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Doctor ID" value={id} onChange={e => setId(e.target.value)} required />
      <input placeholder="New availability (comma separated)" value={availability} onChange={e => setAvailability(e.target.value)} required />
      <button type="submit">Update Availability</button>
    </form>
  );
}
