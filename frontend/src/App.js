import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';

// Styles
import './App.css';

// Main App Component
function App() {
  return (
    <Router>
      <div className="App">
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

// Dashboard Component (All features in one file)
function Dashboard() {
  const [activeTab, setActiveTab] = React.useState('donor');
  const [donors, setDonors] = React.useState([]);
  const [emergencies, setEmergencies] = React.useState([]);
  const [feedback, setFeedback] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [socket, setSocket] = React.useState(null);

  // Mock user data
  const user = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    bloodGroup: 'O+',
    isDonor: true
  };

  // Initialize Socket
  React.useEffect(() => {
    const newSocket = io('http://localhost:5001', {
      transports: ['websocket', 'polling']
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });
    
    newSocket.on('donor-updated', (data) => {
      toast.info(`${data.name} is now ${data.available ? 'available' : 'unavailable'}`);
    });
    
    newSocket.on('new-emergency', (data) => {
      toast.warning(`🚨 New emergency: ${data.emergency.bloodGroup} needed!`);
      setEmergencies(prev => [data.emergency, ...prev]);
    });
    
    newSocket.on('new-notification', (data) => {
      toast.info(data.message || 'New notification');
      setNotifications(prev => [{
        id: Date.now(),
        type: data.type,
        title: data.title,
        message: data.message,
        read: false,
        timestamp: new Date().toISOString()
      }, ...prev]);
    });
    
    setSocket(newSocket);
    
    return () => newSocket.disconnect();
  }, []);

  // Fetch initial data
  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch donors
      const donorsRes = await fetch('http://localhost:5001/api/donors');
      const donorsData = await donorsRes.json();
      if (donorsData.success) setDonors(donorsData.donors);
      
      // Fetch emergencies
      const emergenciesRes = await fetch('http://localhost:5001/api/emergencies');
      const emergenciesData = await emergenciesRes.json();
      if (emergenciesData.success) setEmergencies(emergenciesData.emergencies);
      
      // Fetch feedback
      const feedbackRes = await fetch('http://localhost:5001/api/feedback');
      const feedbackData = await feedbackRes.json();
      if (feedbackData.success) setFeedback(feedbackData.feedback);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityToggle = async () => {
    const newStatus = !isAvailable;
    
    try {
      const response = await fetch(`http://localhost:5001/api/donors/1/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsAvailable(newStatus);
        
        // Emit socket event
        if (socket) {
          socket.emit('donor-availability', {
            donorId: 1,
            available: newStatus,
            name: user.name,
            timestamp: new Date().toISOString()
          });
        }
        
        toast.success(`You are now ${newStatus ? 'available' : 'unavailable'} as a donor`);
      } else {
        toast.error('Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Error updating availability');
    }
  };

  const handleEmergencyActivation = async () => {
    const emergencyData = {
      patientName: 'Emergency Patient',
      bloodGroup: 'O+',
      location: { lat: 23.8103, lng: 90.4125 },
      description: 'Emergency medical assistance required',
      timestamp: new Date().toISOString()
    };
    
    try {
      const response = await fetch('http://localhost:5001/api/emergencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emergencyData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Emergency activated! Help is on the way.');
        setEmergencies(prev => [data.emergency, ...prev]);
        
        // Emit socket event
        if (socket) {
          socket.emit('emergency-activated', {
            emergency: data.emergency,
            timestamp: new Date().toISOString()
          });
        }
        
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

  const handleFeedbackSubmit = async (rating, comment, pros, cons) => {
    // Convert pros and cons to arrays, filtering out empty strings
    const prosArray = Array.isArray(pros) 
      ? pros.filter(p => p && p.trim()) 
      : (pros && pros.trim() ? [pros.trim()] : []);
    const consArray = Array.isArray(cons) 
      ? cons.filter(c => c && c.trim()) 
      : (cons && cons.trim() ? [cons.trim()] : []);
    
    const feedbackData = {
      name: user.name,
      rating,
      comment,
      pros: prosArray,
      cons: consArray
    };
    
    try {
      const response = await fetch('http://localhost:5001/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Thank you for your feedback!');
        setFeedback(prev => [data.feedback, ...prev]);
        
        // Emit socket event
        if (socket) {
          socket.emit('feedback-submitted', {
            feedback: data.feedback,
            timestamp: new Date().toISOString()
          });
        }
        
        return { success: true };
      } else {
        toast.error(data.error || 'Failed to submit feedback');
        return { success: false };
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error(`Error: ${error.message || 'Network error'}`);
      return { success: false };
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    toast.success('All notifications marked as read');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Donor Map Component
  const DonorMap = () => (
    <div className="donor-map">
      <div className="map-placeholder">
        <i className="fas fa-map-marker-alt" style={{ fontSize: '3rem', color: '#2a6ecc' }}></i>
        <p>Live donor locations on map</p>
        <div className="map-points">
          {donors.slice(0, 5).map((donor, index) => (
            <div 
              key={donor.id} 
              className="map-point"
              style={{
                top: `${20 + (index * 15)}%`,
                left: `${30 + (index * 10)}%`,
                backgroundColor: donor.available ? '#27ae60' : '#e74c3c'
              }}
              title={`${donor.name} - ${donor.bloodGroup}`}
            >
              {donor.bloodGroup}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Availability Toggle Component
  const AvailabilityToggle = () => (
    <div className="availability-toggle">
      <div className="toggle-label">
        <span className="label-text">Donor Status:</span>
        <span className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </div>
      
      <label className="toggle-switch">
        <input 
          type="checkbox" 
          checked={isAvailable}
          onChange={handleAvailabilityToggle}
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );

  // Emergency Button Component
  const EmergencyButton = () => {
    const [showConfirm, setShowConfirm] = React.useState(false);
    const [countdown, setCountdown] = React.useState(5);

    const startCountdown = () => {
      setShowConfirm(true);
      setCountdown(5);
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleEmergencyActivation();
            setShowConfirm(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const cancelEmergency = () => {
      setShowConfirm(false);
      toast.info('Emergency activation cancelled');
    };

    return (
      <div className="emergency-button-wrapper">
        {showConfirm ? (
          <div className="emergency-confirm-modal">
            <div className="confirm-header">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Confirm Emergency Activation</h3>
            </div>
            
            <div className="confirm-warning">
              <i className="fas fa-exclamation-circle"></i>
              <p>This will alert nearby hospitals and blood donors</p>
            </div>
            
            <div className="countdown-display">
              <div className="countdown-number">{countdown}</div>
              <p>Activating in {countdown} seconds...</p>
            </div>
            
            <div className="confirm-actions">
              <button 
                className="btn confirm-btn"
                onClick={() => {
                  setShowConfirm(false);
                  handleEmergencyActivation();
                }}
              >
                Activate Now
              </button>
              <button 
                className="btn cancel-btn"
                onClick={cancelEmergency}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button 
            type="button"
            className="emergency-activation-btn"
            onClick={startCountdown}
            aria-label="Activate Emergency Mode"
            title="Activate Emergency Mode"
          >
            <i className="fas fa-bell"></i>
            <span>Activate Emergency Mode</span>
          </button>
        )}
      </div>
    );
  };

  // Emergency Status Component
  const EmergencyStatus = ({ emergency }) => (
    <div className="emergency-status-card">
      <div className="emergency-header">
        <div className="emergency-title">
          <i className="fas fa-exclamation-circle"></i>
          <h4>{emergency.patientName} - {emergency.bloodGroup}</h4>
        </div>
        <span className={`status-badge ${emergency.status}`}>
          {emergency.status}
        </span>
      </div>
      
      <div className="emergency-details">
        <div className="detail-item">
          <span className="label">Location:</span>
          <span className="value">{emergency.location.lat.toFixed(4)}, {emergency.location.lng.toFixed(4)}</span>
        </div>
        <div className="detail-item">
          <span className="label">Time:</span>
          <span className="value">{new Date(emergency.createdAt).toLocaleTimeString()}</span>
        </div>
        <div className="detail-item">
          <span className="label">Responders:</span>
          <span className="value">{emergency.hospitalsNotified} hospitals, {emergency.donorsNotified} donors alerted</span>
        </div>
      </div>
      
      <div className="emergency-actions">
        <button className="btn primary-btn">
          <i className="fas fa-phone"></i> Call Emergency
        </button>
        <button className="btn outline-btn">
          View Details
        </button>
      </div>
    </div>
  );

  // Feedback Form Component
  const FeedbackFormComponent = () => {
    const [rating, setRating] = React.useState(0);
    const [comment, setComment] = React.useState('');
    const [pros, setPros] = React.useState('');
    const [cons, setCons] = React.useState('');

    const handleSubmit = async () => {
      // Validate rating
      if (!rating || rating === 0) {
        toast.error('Please select a rating (1-5 stars)');
        return;
      }
      
      // Validate comment
      if (!comment || !comment.trim()) {
        toast.error('Please enter a comment');
        return;
      }
      
      const result = await handleFeedbackSubmit(rating, comment.trim(), pros, cons);
      if (result && result.success) {
        setRating(0);
        setComment('');
        setPros('');
        setCons('');
      }
    };

    return (
      <div className="feedback-form">
        <div className="rating-input">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= rating ? 'selected' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setRating(star);
                }}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <i className="fas fa-star"></i>
              </button>
            ))}
          </div>
          <div className="rating-text">
            {rating === 0 ? 'Select rating' : 
             rating === 1 ? 'Very Poor' :
             rating === 2 ? 'Poor' :
             rating === 3 ? 'Average' :
             rating === 4 ? 'Good' : 'Excellent'}
          </div>
        </div>
        
        <textarea
          className="comment-input"
          placeholder="Share your experience in detail..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength="500"
          rows="4"
        />
        <div className="char-count">{comment.length}/500 characters</div>
        
        <input
          type="text"
          className="pros-input"
          placeholder="What did you like? (e.g., Professional staff, clean facilities)"
          value={pros}
          onChange={(e) => setPros(e.target.value)}
        />
        
        <input
          type="text"
          className="cons-input"
          placeholder="What could be improved? (e.g., Waiting time, communication)"
          value={cons}
          onChange={(e) => setCons(e.target.value)}
        />
        
        <button 
          type="button"
          className="submit-feedback-btn"
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <i className="fas fa-paper-plane"></i> Submit Feedback
        </button>
      </div>
    );
  };

  // Review List Component
  const ReviewListComponent = () => (
    <div className="review-list">
      {feedback.length === 0 ? (
        <div className="no-reviews">No reviews yet. Be the first to review!</div>
      ) : (
        feedback.slice(0, 3).map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <div className="reviewer-name">{review.name}</div>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i} 
                        className={`fas fa-star ${i < review.rating ? 'filled' : ''}`}
                      ></i>
                    ))}
                  </div>
                </div>
              </div>
              <div className="review-date">{review.date}</div>
            </div>
            
            <div className="review-comment">{review.comment}</div>
            
            {(review.pros.length > 0 || review.cons.length > 0) && (
              <div className="review-tags">
                {review.pros.map((pro, idx) => (
                  <span key={idx} className="tag positive-tag">✓ {pro}</span>
                ))}
                {review.cons.map((con, idx) => (
                  <span key={idx} className="tag negative-tag">✗ {con}</span>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  // Notification Bell Component
  const NotificationBell = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="notification-wrapper">
        <button 
          type="button"
          className="notification-bell-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          title="Notifications"
        >
          <i className="fas fa-bell"></i>
          {unreadCount > 0 && (
            <span className="notification-count" aria-label={`${unreadCount} unread notifications`}>
              {unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              <button 
                className="mark-all-read"
                onClick={() => {
                  markAllNotificationsAsRead();
                  setIsOpen(false);
                }}
              >
                Mark all read
              </button>
            </div>
            
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 5).map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.read ? '' : 'unread'}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="notification-icon">
                      <i className={`fas fa-${notification.type === 'emergency' ? 'exclamation-triangle' : 
                                      notification.type === 'donor' ? 'tint' : 'info-circle'}`}></i>
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">
                        {new Date(notification.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="notification-unread-dot"></div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div className="notification-footer">
              <button onClick={() => setIsOpen(false)}>
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Header Component
  const Header = () => (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <i className="fas fa-heartbeat"></i>
          <h1>Life<span>Link</span></h1>
        </div>
        
        <div className="header-right">
          <NotificationBell />
          
          <div className="user-info">
            <div className="user-avatar">
              {user.name.charAt(0)}
            </div>
            <span className="user-name">{user.name}</span>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div className="dashboard-container">
      <Header />
      
      <main className="main-content">
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
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <>
                {activeTab === 'donor' && (
                  <div className="donor-tab">
                    <div className="section-header">
                      <h2><i className="fas fa-tint"></i> Live Donor Availability</h2>
                      <AvailabilityToggle />
                    </div>
                    
                    <div className="donor-section">
                      <div className="donor-map-section">
                        <h3>Nearby Donors</h3>
                        <DonorMap />
                      </div>
                      
                      <div className="donor-list-section">
                        <h3>Available Donors ({donors.filter(d => d.available).length})</h3>
                        {donors.length > 0 ? (
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
                                    <span className="distance">{donor.distance?.toFixed(1) || 'N/A'} km</span>
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
                      <EmergencyButton />
                      
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
                        <FeedbackFormComponent />
                      </div>
                      
                      <div className="reviews-section">
                        <h3>Recent Reviews</h3>
                        <ReviewListComponent />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>© 2023 LifeLink - Smart Emergency Health System</p>
          <p>Emergency Hotline: 911 | Support: support@lifelink.com</p>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;