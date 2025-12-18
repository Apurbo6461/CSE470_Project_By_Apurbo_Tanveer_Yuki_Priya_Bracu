import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRole, setSelectedRole] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showBloodRequests, setShowBloodRequests] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "doctor",
  });

  /* ===== AUTH + LOAD USERS ===== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now() || decoded.role !== "admin") {
      localStorage.clear();
      return navigate("/login");
    }

    axios
      .get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, [navigate]);

  /* ===== USER ACTIONS ===== */
  const addUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:5000/api/admin/users",
      newUser,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setUsers([...users, res.data]);
    setShowAddUserForm(false);
    setNewUser({ name: "", email: "", password: "", role: "doctor" });
  };

  const removeUser = async (id) => {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(users.filter((u) => u._id !== id));
  };

  /* ===== BLOOD REQUESTS ===== */
  const loadBloodRequests = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/blood/admin", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBloodRequests(res.data);
    setShowBloodRequests(true);
    setSelectedRole(null);
    setShowAddUserForm(false);
  };

  const approve = async (id) => {
    const token = localStorage.getItem("token");
    await axios.patch(
      `http://localhost:5000/api/blood/admin/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setBloodRequests((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, status: "approved" } : r
      )
    );
  };

  const reject = async (id) => {
    const token = localStorage.getItem("token");
    await axios.patch(
      `http://localhost:5000/api/blood/admin/${id}/reject`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setBloodRequests((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, status: "rejected" } : r
      )
    );
  };

  /* ===== BACK ===== */
  const goBack = () => {
    setShowAddUserForm(false);
    setShowBloodRequests(false);
    setSelectedRole(null);
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2 className="error">{error}</h2>;

  const roles = ["doctor", "patient", "donor", "hospital"];
  const filteredUsers = selectedRole
    ? users.filter((u) => u.role === selectedRole)
    : [];

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {/* ===== ACTION CARDS ===== */}
      {!showAddUserForm && !showBloodRequests && (
        <div className="action-cards">
          <div
            className="action-card add"
            onClick={() => setShowAddUserForm(true)}
          >
            <h3>Add User</h3>
            <p>Create new system user</p>
          </div>

          <div
            className="action-card verify"
            onClick={loadBloodRequests}
          >
            <h3>Verify Blood Donors</h3>
            <p>Approve or reject requests</p>
          </div>
        </div>
      )}

      {/* ===== BACK BUTTON ===== */}
      {(showAddUserForm || showBloodRequests || selectedRole) && (
        <button className="btn back-btn" onClick={goBack}>
          ← Back 
        </button>
      )}

      {/* ===== ADD USER FORM ===== */}
      {showAddUserForm && (
        <form className="card" onSubmit={addUser}>
          <h3>Add New User</h3>
          <input placeholder="Name" required
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input type="email" placeholder="Email" required
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input type="password" placeholder="Password" required
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <select
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <button className="btn primary">Add User</button>
        </form>
      )}

      {/* ===== ROLE CARDS ===== */}
      {!showAddUserForm && !showBloodRequests && (
        <div className="cards">
          {roles.map((r) => (
            <div
              key={r}
              className="stat"
              onClick={() => setSelectedRole(r)}
            >
              <h3>{r.toUpperCase()}</h3>
              <p>{users.filter((u) => u.role === r).length}</p>
            </div>
          ))}
        </div>
      )}

      {/* ===== USERS TABLE ===== */}
      {selectedRole && (
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <button className="btn danger" onClick={() => removeUser(u._id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ===== BLOOD REQUESTS ===== */}
      {showBloodRequests && (
        <>
          <h2>Blood Donor Requests</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Blood</th><th>Location</th>
                <th>Contact</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bloodRequests.map((r) => (
                <tr key={r._id}>
                  <td>{r.name}</td>
                  <td>{r.bloodGroup}</td>
                  <td>{r.location}</td>
                  <td>{r.contactInfo}</td>
                  <td>
                    <span className={`badge ${r.status}`}>{r.status}</span>
                  </td>
                  <td>
                    {r.status === "pending" && (
                      <>
                        <button className="btn success" onClick={() => approve(r._id)}>Approve</button>
                        <button className="btn warning" onClick={() => reject(r._id)}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
