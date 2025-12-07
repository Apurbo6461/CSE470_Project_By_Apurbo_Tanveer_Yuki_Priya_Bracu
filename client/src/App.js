import './App.css';
import CreateDoctor from "./components/CreateDoctor";
import UpdateAvailability from "./components/UpdateAvailability";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Doctor Profile Management</h1>

      <h2>Create Doctor Profile</h2>
      <CreateDoctor />

      <h2>Update Availability</h2>
      <UpdateAvailability />
    </div>
  );
}

export default App;