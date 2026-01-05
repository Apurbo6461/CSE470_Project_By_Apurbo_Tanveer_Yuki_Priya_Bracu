import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import DonorMap from '../components/Donor/DonorMap';
import AvailabilityToggle from '../components/Donor/AvailabilityToggle';
import EmergencyButton from '../components/Emergency/EmergencyButton';
import EmergencyStatus from '../components/Emergency/EmergencyStatus';
import FeedbackForm from '../components/Feedback/FeedbackForm';
import ReviewList from '../components/Feedback/ReviewList';

const Dashboard = () => {
  const { user } = useAuth();
  const { on, off } = useSocket();
  const [activeTab, setActiveTab] = useState('donor');
  const [donors, setDonors] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState({
    donors: false,
    emergencies: false,
    feedback: false
  });

  // Fetch data on mount
  useEffect(() => {
    fetchDonors();
    fetchEmergencies();
    fetchFeedback();
  }, []);

  // Socket event listeners
  useEffect(() => {
    const handleDonorUpdated = (data) => {
      setDonors(prev => prev.map(donor => 
        donor.id === data.donorId ? { ...donor, available: data.available } : donor
      ));
      toast.info(`${data.name} is now ${data.available ? 'available' : 'unavailable'}`);
    };

    const handleNewEmergency = (data) => {
      setEmergencies(prev => [data.emergency, ...prev]);
    };

    const handleEmergencyUpdated = (data) => {
      setEmergencies(prev => prev.map(emergency => 
        emergency.id === data.emergencyId ? { ...emergency, status: data.status } : emergency
      ));
    };

    const handleNewFeedback = (data) => {
      setFeedback(prev => [data.feedback, ...prev]);
      toast.success('New feedback received!');
    };

    if (on) {
      on('donor-updated', handleDonorUpdated);
      on('new-emergency', handleNewEmergency);
      on('emergency-updated', handleEmergencyUpdated);
      on('new-feedback', handleNewFeedback);
    }

    return () => {
      if (off) {
        off('donor-updated', handleDonorUpdated);
        off('new-emergency', handleNewEmergency);
        off('emergency-updated', handleEmergencyUpdated);
        off('new-feedback', handleNewFeedback);
      }
    };
  }, [on, off]);

  const fetchDonors = async () => {
    try {
      setLoading(prev => ({ ...prev, donors: true }));
      const response = await fetch('http://localhost:5000/api/donors/nearby?lat=23.8103&lng=90.4125');
      const data = await response.json();
      if (data.success) {
        setDonors(data.donors);
      }
    } catch (error) {
      toast.error('Failed to load donors');
      console.error('Error fetching donors:', error);
    } finally {
      setLoading(prev => ({ ...prev, donors: false }));
    }
  };

  const fetchEmergencies = async () => {
    try {
      setLoading(prev => ({ ...prev, emergencies: true }));
      const response = await fetch('http://localhost:5000/api/emergencies');
      const data = await response.json();
      if (data.success) {
        setEmergencies(data.emergencies);
      }
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    } finally {
      setLoading(prev => ({ ...prev, emergencies: false }));
    }
  };

  const fetchFeedback = async () => {
    try {
      setLoading(prev => ({ ...prev, feedback: true }));
      const response = await fetch('http://localhost:5000/api/feedback');
      const data = await response.json();
      if (data.success) {
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(prev => ({ ...prev, feedback: false }));
    }
  };

  const handleEmergencyActivation = async (emergencyData) => {
    try {
      const response = await fetch('http://localhost:5000/api/emergencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emergencyData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Emergency activated successfully!');
        setEmergencies(prev => [data.emergency, ...prev]);
        return { success: true, data };
      } else {
        toast.error('Failed to activate emergency');
        return { success: false };
      }
    } catch (error) {
      toast.error('Network error');
      return { success: false };
    }
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Thank you for your feedback!');
        setFeedback(prev => [data.feedback, ...prev]);
        return { success: true };
      } else {
        toast.error('Failed to submit feedback');
        return { success: false };
      }
    } catch (error) {
      toast.error('Network error');
      return { success: false };
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}!</h1>
        <p>Smart Emergency Health System</p>
      </div>

      <div className="feature-tabs">
        <button 
          className={`tab-btn ${activeTab === 'donor' ? 'active' : ''}`}
          onClick={() => setActiveTab('donor')}
        >
          <i className="fas fa-tint"></i>
          <span>Live Donors</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
          onClick={() => setActiveTab('emergency')}
        >
          <i className="fas fa-exclamation-triangle"></i>
          <span>Emergency</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <i className="fas fa-star"></i>
          <span>Feedback</span>
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'donor' && (
          <div className="donor-tab">
            <div className="section-header">
              <h2><i className="fas fa-tint"></i> Live Donor Availability</h2>
              {user.isDonor && <AvailabilityToggle />}
            </div>
            
            <div className="donor-section">
              <div className="donor-map-section">
                <h3>Nearby Donors</h3>
                <DonorMap donors={donors} />
              </div>
              
              <div className="donor-list-section">
                <h3>Available Donors ({donors.filter(d => d.available).length})</h3>
                {loading.donors ? (
                  <div className="loading">Loading donors...</div>
                ) : donors.length > 0 ? (
                  <div className="donor-list">
                    {donors.filter(d => d.available).map(donor => (
                      <div key={donor.id} className="donor-card">
                        <div className="donor-avatar">
                          {donor.name.charAt(0)}
                        </div>
                        <div className="donor-info">
                          <div className="donor-name">{donor.name}</div>
                          <div className="donor-details">
                            <span className="blood-group">{donor.bloodGroup}</span>
                            <span className="distance">{donor.distance.toFixed(1)} km</span>
                          </div>
                        </div>
                        <div className={`status ${donor.available ? 'available' : 'unavailable'}`}>
                          {donor.available ? 'Available' : 'Unavailable'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No donors available</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="emergency-tab">
            <div className="section-header">
              <h2><i className="fas fa-exclamation-triangle"></i> Emergency Mode</h2>
            </div>
            
            <div className="emergency-section">
              <EmergencyButton onActivate={handleEmergencyActivation} />
              
              {emergencies.length > 0 && (
                <div className="active-emergencies">
                  <h3>Active Emergencies</h3>
                  {emergencies
                    .filter(e => e.status === 'active')
                    .map(emergency => (
                      <EmergencyStatus 
                        key={emergency.id} 
                        emergency={emergency} 
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="feedback-tab">
            <div className="section-header">
              <h2><i className="fas fa-star"></i> Feedback & Ratings</h2>
              <div className="rating-summary">
                <div className="average-rating">
                  <span className="rating-value">4.7</span>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fas fa-star ${i < 4 ? 'filled' : 'half'}`}></i>
                    ))}
                  </div>
                  <span className="rating-count">Based on {feedback.length} reviews</span>
                </div>
              </div>
            </div>
            
            <div className="feedback-section">
              <div className="feedback-form-section">
                <h3>Submit Your Feedback</h3>
                <FeedbackForm onSubmit={handleFeedbackSubmit} />
              </div>
              
              <div className="reviews-section">
                <h3>Recent Reviews</h3>
                <ReviewList reviews={feedback.slice(0, 5)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;