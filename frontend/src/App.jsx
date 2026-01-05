import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [donors, setDonors] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [location, setLocation] = useState(null);

  // Check API health
  useEffect(() => {
    axios.get('http://localhost:5001/')
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const getNearbyDonors = async () => {
    if (!location) {
      alert('Please enable location services first');
      return;
    }
    
    try {
      const response = await axios.get('http://localhost:5001/api/donors/nearby', {
        params: {
          lat: location.lat,
          lng: location.lng,
          radius: 10
        }
      });
      setDonors(response.data.donors || []);
    } catch (error) {
      console.error('Error fetching donors:', error);
      alert('Error fetching nearby donors');
    }
  };

  const activateEmergencyMode = async () => {
    if (!location) {
      alert('Please enable location services first');
      return;
    }
    
    try {
      await axios.post('http://localhost:5001/api/emergencies', {
        patientName: 'Emergency Patient',
        bloodGroup: 'O+',
        location: { lat: location.lat, lng: location.lng },
        description: 'Emergency medical assistance required'
      });
      alert('Emergency mode activated! Your location is now shared.');
    } catch (error) {
      console.error('Error activating emergency mode:', error);
      alert('Error activating emergency mode');
    }
  };

  const submitFeedback = async () => {
    const sampleFeedback = {
      name: 'Anonymous',
      rating: 5,
      comment: 'Great donor experience!',
      pros: ['Quick response and professional'],
      cons: []
    };

    try {
      await axios.post('http://localhost:5001/api/feedback', sampleFeedback);
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    }
  };

  const getNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/notifications');
      console.log('Notifications:', response.data);
      alert(`You have ${response.data.unreadCount || 0} unread notifications`);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏥 LifeLink</h1>
        <div className="status">
          API Status: <span className={apiStatus}>{apiStatus.toUpperCase()}</span>
        </div>
      </header>

      <main className="App-main">
        {/* Live Donor Availability Section */}
        <section className="section">
          <h2>Live Donor Availability</h2>
          <div className="status-card">
            <div className="status-item">
              <span className="label">Current Status:</span>
              <span className="value available">Available</span>
            </div>
            <button className="btn">Toggle Availability</button>
          </div>
          
          <div className="emergency-section">
            <h3>Emergency Mode</h3>
            <p>Activate to share your real-time location</p>
            <button 
              className="btn emergency-btn"
              onClick={activateEmergencyMode}
            >
              ACTIVATE EMERGENCY MODE
            </button>
            {location && (
              <div className="location-info">
                <p>📍 Your location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
              </div>
            )}
          </div>
        </section>

        {/* Nearby Donors Section */}
        <section className="section">
          <h2>Nearby Available Donors</h2>
          <button className="btn" onClick={getNearbyDonors}>
            Find Nearby Donors
          </button>
          {donors.length > 0 && (
            <div className="donors-list">
              {donors.map((donor, index) => (
                <div key={index} className="donor-card">
                  <h3>{donor.name}</h3>
                  <p>Blood Type: {donor.bloodGroup}</p>
                  <p>Status: {donor.available ? 'Available' : 'Unavailable'}</p>
                  <p>Distance: {donor.distance?.toFixed(1) || 'N/A'} km</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Feedback Section */}
        <section className="section">
          <h2>Feedback & Ratings</h2>
          <div className="rating">
            <span className="stars">★★★★★</span>
            <span className="rating-value">4.7 Average Rating</span>
          </div>
          
          <div className="feedback-form">
            <textarea 
              placeholder="Share your experience... (0/500 characters)"
              rows="4"
            />
            <div className="feedback-questions">
              <input type="text" placeholder="What did you like?" />
              <input type="text" placeholder="What could be improved?" />
            </div>
            <button className="btn" onClick={submitFeedback}>
              Submit Feedback
            </button>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="section">
          <h2>Notifications</h2>
          <button className="btn" onClick={getNotifications}>
            Check Notifications
          </button>
          <div className="notifications">
            <p>Recent notifications will appear here</p>
          </div>
        </section>

        {/* Test API Section */}
        <section className="section">
          <h2>API Testing</h2>
          <div className="api-test-buttons">
            <button className="btn" onClick={() => window.open('http://localhost:5001/', '_blank')}>
              Test API Endpoint
            </button>
            <button className="btn" onClick={() => window.open('http://localhost:5001/api/donors', '_blank')}>
              View All Donors
            </button>
          </div>
        </section>
      </main>

      <footer className="App-footer">
        <p>LifeLink - Connecting donors with recipients in real-time</p>
      </footer>
    </div>
  );
}

export default App;