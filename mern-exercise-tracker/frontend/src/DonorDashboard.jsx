import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

export default function DonorDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Try get user object; fallback to role-only info
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const storedRole = localStorage.getItem("role") || null;
      if (storedUser && storedUser.role === "donor") {
        setUser(storedUser);
      } else if (storedRole === "donor") {
        // minimal user fallback
        const fallback = { name: "", email: localStorage.getItem("email") || "", role: "donor" };
        setUser(fallback);
      } else {
        // not a donor -> go to login
        window.location.href = "/login";
        return;
      }
    } catch (e) {
      window.location.href = "/login";
      return;
    }

    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRequests() {
    setError("");
    setLoading(true);
    setRequests([]);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/api/requests/list`, { headers });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Server error: ${res.status} ${txt}`);
      }
      const data = await res.json();
      setRequests(data.results || []);
    } catch (err) {
      console.error("fetchRequests error", err);
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    window.location.href = "/login";
  }

  return (
    <div>
      <h3>Donor Dashboard — Open Requests</h3>

      <div style={{ marginBottom: 8 }}>
        {user ? (
          <div>
            Logged in as: <strong>{user.name || "Donor"}</strong> ({user.email || "no-email"}) —{" "}
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <div style={{ color: "#666" }}>Loading user…</div>
        )}
      </div>

      <div style={{ marginBottom: 8 }}>
        <button onClick={fetchRequests} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {requests.length === 0 && !loading && <div style={{ color: "#666" }}>No open requests.</div>}

      <ul style={{ paddingLeft: 16 }}>
        {requests.map((r) => (
          <li key={r._id} style={{ marginBottom: 12, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
            <div>
              <strong>{r.requesterInfo?.name}</strong>{" "}
              {r.requesterInfo?.email && `(${r.requesterInfo.email})`}
            </div>
            <div>
              Blood Group: <strong>{r.bloodGroup}</strong> • Units: {r.units} • Urgency: {r.urgency}
            </div>
            {r.message && <div>Message: {r.message}</div>}
            <div style={{ fontSize: 12, color: "#666" }}>
              Requested: {new Date(r.createdAt).toLocaleString()}
            </div>
            <div style={{ marginTop: 6 }}>
              <button onClick={() => navigator.clipboard.writeText(r.requesterInfo?.email || "")}>
                Copy Email
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}