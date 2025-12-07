import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Notes() {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/notes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(res.data);
      } catch (err) {
        console.error(err);
        setNotes("Error fetching notes");
      }
    };
    fetchNotes();
  }, []);

  return <div>{notes}</div>;
}
