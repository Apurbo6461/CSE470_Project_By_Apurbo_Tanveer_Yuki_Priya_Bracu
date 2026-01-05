const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lifelink', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.log('Continuing without MongoDB - using in-memory data');
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('donor-availability', (data) => {
    socket.broadcast.emit('donor-updated', data);
  });
  
  socket.on('emergency-activated', (data) => {
    socket.broadcast.emit('new-emergency', data);
  });
  
  socket.on('feedback-submitted', (data) => {
    socket.broadcast.emit('new-feedback', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Store io instance in app for route access
app.set('io', io);

// Mock data for testing
const mockDonors = [
  { id: 1, name: "Alex Johnson", bloodGroup: "O+", distance: 1.2, available: true, location: { lat: 23.811, lng: 90.413 } },
  { id: 2, name: "Maria Garcia", bloodGroup: "A-", distance: 2.5, available: true, location: { lat: 23.809, lng: 90.411 } },
  { id: 3, name: "David Smith", bloodGroup: "B+", distance: 3.1, available: false, location: { lat: 23.812, lng: 90.415 } },
  { id: 4, name: "Lisa Wang", bloodGroup: "AB+", distance: 4.3, available: true, location: { lat: 23.808, lng: 90.410 } },
  { id: 5, name: "Robert Kim", bloodGroup: "O-", distance: 5.0, available: true, location: { lat: 23.814, lng: 90.409 } }
];

const mockFeedback = [
  { id: 1, name: "Michael Brown", rating: 5, date: "2023-10-15", comment: "Excellent service! The response time was amazing.", pros: ["Professional staff", "Fast response"], cons: ["None"] },
  { id: 2, name: "Sarah Johnson", rating: 4, date: "2023-10-10", comment: "Good experience overall. Very helpful.", pros: ["Clean facilities"], cons: ["Parking difficult"] },
  { id: 3, name: "James Wilson", rating: 5, date: "2023-10-05", comment: "LifeLink saved my life during an emergency!", pros: ["Life-saving", "24/7 support"], cons: [] }
];

// API Routes
app.get('/api/donors', (req, res) => {
  const { available, bloodGroup, limit = 20 } = req.query;
  let donors = [...mockDonors];
  
  if (available === 'true') {
    donors = donors.filter(d => d.available);
  }
  
  if (bloodGroup) {
    donors = donors.filter(d => d.bloodGroup === bloodGroup);
  }
  
  donors = donors.slice(0, parseInt(limit));
  
  res.json({
    success: true,
    count: donors.length,
    donors
  });
});

app.get('/api/donors/nearby', (req, res) => {
  const { lat = 23.8103, lng = 90.4125, radius = 10, latitude, longitude } = req.query;
  // Support both lat/lng and latitude/longitude parameter names
  const finalLat = lat || latitude || 23.8103;
  const finalLng = lng || longitude || 90.4125;
  
  const donors = mockDonors
    .filter(donor => donor.available)
    .map(donor => ({
      ...donor,
      distance: calculateDistance(
        parseFloat(finalLat),
        parseFloat(finalLng),
        donor.location.lat,
        donor.location.lng
      )
    }))
    .filter(donor => donor.distance <= parseFloat(radius))
    .sort((a, b) => a.distance - b.distance);
  
  res.json({
    success: true,
    count: donors.length,
    donors
  });
});

app.patch('/api/donors/:id/availability', (req, res) => {
  const { id } = req.params;
  const { available } = req.body;
  
  const donorIndex = mockDonors.findIndex(d => d.id === parseInt(id));
  
  if (donorIndex === -1) {
    return res.status(404).json({ success: false, error: 'Donor not found' });
  }
  
  mockDonors[donorIndex].available = available;
  
  // Emit socket event
  const io = app.get('io');
  io.emit('donor-updated', {
    donorId: id,
    available,
    name: mockDonors[donorIndex].name
  });
  
  res.json({
    success: true,
    message: `Donor availability updated to ${available ? 'Available' : 'Unavailable'}`,
    donor: mockDonors[donorIndex]
  });
});

// Emergency endpoints
let activeEmergencies = [];

app.post('/api/emergencies', (req, res) => {
  const { patientName, bloodGroup, location, description } = req.body;
  
  const emergency = {
    id: Date.now(),
    patientName,
    bloodGroup,
    location: location || { lat: 23.8103, lng: 90.4125 },
    description,
    status: 'active',
    createdAt: new Date().toISOString(),
    responders: [],
    hospitalsNotified: 2,
    donorsNotified: 3
  };
  
  activeEmergencies.push(emergency);
  
  // Find matching donors
  const matchingDonors = mockDonors.filter(d => 
    d.bloodGroup === bloodGroup && 
    d.available &&
    calculateDistance(
      location.lat,
      location.lng,
      d.location.lat,
      d.location.lng
    ) <= 10
  );
  
  // Emit socket event
  const io = app.get('io');
  io.emit('new-emergency', {
    emergency,
    matchingDonors: matchingDonors.length,
    timestamp: new Date().toISOString()
  });
  
  // Create notifications for matching donors
  matchingDonors.forEach(donor => {
    io.emit('new-notification', {
      type: 'emergency',
      title: 'Emergency Blood Request',
      message: `Urgent need for ${bloodGroup} blood near your location`,
      donorId: donor.id,
      timestamp: new Date().toISOString()
    });
  });
  
  res.status(201).json({
    success: true,
    message: 'Emergency activated successfully',
    emergency,
    matchingDonors: matchingDonors.length
  });
});

app.get('/api/emergencies', (req, res) => {
  res.json({
    success: true,
    count: activeEmergencies.length,
    emergencies: activeEmergencies
  });
});

app.patch('/api/emergencies/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const emergencyIndex = activeEmergencies.findIndex(e => e.id === parseInt(id));
  
  if (emergencyIndex === -1) {
    return res.status(404).json({ success: false, error: 'Emergency not found' });
  }
  
  activeEmergencies[emergencyIndex].status = status;
  
  if (status === 'resolved' || status === 'cancelled') {
    activeEmergencies[emergencyIndex].resolvedAt = new Date().toISOString();
  }
  
  const io = app.get('io');
  io.emit('emergency-updated', {
    emergencyId: id,
    status,
    timestamp: new Date().toISOString()
  });
  
  res.json({
    success: true,
    message: `Emergency status updated to ${status}`,
    emergency: activeEmergencies[emergencyIndex]
  });
});

// Feedback endpoints
app.get('/api/feedback', (req, res) => {
  const { minRating, maxRating, limit = 10 } = req.query;
  let feedback = [...mockFeedback];
  
  if (minRating) {
    feedback = feedback.filter(f => f.rating >= parseInt(minRating));
  }
  
  if (maxRating) {
    feedback = feedback.filter(f => f.rating <= parseInt(maxRating));
  }
  
  feedback = feedback.slice(0, parseInt(limit));
  
  // Calculate average rating
  const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
  
  res.json({
    success: true,
    count: feedback.length,
    averageRating: averageRating.toFixed(1),
    feedback
  });
});

app.post('/api/feedback', (req, res) => {
  const { name, rating, comment, pros, cons } = req.body;
  
  if (!rating || !comment) {
    return res.status(400).json({ 
      success: false, 
      error: 'Rating and comment are required' 
    });
  }
  
  // Process pros and cons - filter out empty strings
  const processArray = (arr) => {
    if (Array.isArray(arr)) {
      return arr.filter(item => item && item.trim && item.trim().length > 0);
    }
    if (arr && typeof arr === 'string' && arr.trim().length > 0) {
      return [arr.trim()];
    }
    return [];
  };
  
  const newFeedback = {
    id: Date.now(),
    name: name || 'Anonymous',
    rating: parseInt(rating),
    comment: comment.trim(),
    pros: processArray(pros),
    cons: processArray(cons),
    date: new Date().toISOString().split('T')[0],
    helpfulCount: 0,
    reportCount: 0
  };
  
  mockFeedback.unshift(newFeedback);
  
  // Emit socket event
  const io = app.get('io');
  io.emit('new-feedback', {
    feedback: newFeedback,
    averageRating: calculateAverageRating(),
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json({
    success: true,
    message: 'Feedback submitted successfully',
    feedback: newFeedback
  });
});

app.post('/api/feedback/:id/helpful', (req, res) => {
  const { id } = req.params;
  const feedback = mockFeedback.find(f => f.id === parseInt(id));
  
  if (!feedback) {
    return res.status(404).json({ success: false, error: 'Feedback not found' });
  }
  
  feedback.helpfulCount = (feedback.helpfulCount || 0) + 1;
  
  res.json({
    success: true,
    message: 'Marked as helpful',
    helpfulCount: feedback.helpfulCount
  });
});

// Notification endpoints
let notifications = [
  { id: 1, type: 'system', title: 'Welcome to LifeLink', message: 'Your account has been created successfully', read: false, timestamp: '2023-11-20T10:00:00Z' },
  { id: 2, type: 'emergency', title: 'Emergency Alert', message: 'New emergency in your area', read: false, timestamp: '2023-11-20T09:30:00Z' },
  { id: 3, type: 'donor', title: 'Donor Request', message: 'Blood needed for O+ patient', read: true, timestamp: '2023-11-19T14:15:00Z' }
];

app.get('/api/notifications', (req, res) => {
  const { unreadOnly } = req.query;
  
  let filteredNotifications = [...notifications];
  
  if (unreadOnly === 'true') {
    filteredNotifications = filteredNotifications.filter(n => !n.read);
  }
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  res.json({
    success: true,
    count: filteredNotifications.length,
    unreadCount,
    notifications: filteredNotifications
  });
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const notification = notifications.find(n => n.id === parseInt(id));
  
  if (!notification) {
    return res.status(404).json({ success: false, error: 'Notification not found' });
  }
  
  notification.read = true;
  
  res.json({
    success: true,
    message: 'Notification marked as read'
  });
});

app.patch('/api/notifications/read-all', (req, res) => {
  notifications.forEach(n => n.read = true);
  
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'LifeLink API is running!',
    status: 'OK',
    version: '1.0.0',
    endpoints: [
      'GET  /api/donors',
      'GET  /api/donors/nearby',
      'PATCH /api/donors/:id/availability',
      'POST /api/emergencies',
      'GET  /api/emergencies',
      'GET  /api/feedback',
      'POST /api/feedback',
      'GET  /api/notifications'
    ],
    socketEvents: [
      'donor-updated',
      'new-emergency',
      'new-feedback',
      'emergency-updated',
      'new-notification'
    ]
  });
});

// Helper functions
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateAverageRating() {
  if (mockFeedback.length === 0) return 0;
  const total = mockFeedback.reduce((sum, f) => sum + f.rating, 0);
  return (total / mockFeedback.length).toFixed(1);
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server ready`);
});