const Emergency = require('../models/Emergency');
const Donor = require('../models/Donor');
const Notification = require('../models/Notification');
const User = require('../models/user');

// Create emergency
exports.createEmergency = async (req, res) => {
  try {
    const userId = req.user.id;
    const emergencyData = {
      ...req.body,
      userId,
      status: 'active'
    };
    
    // Validate required fields
    if (!emergencyData.patientName || !emergencyData.bloodGroup || !emergencyData.location) {
      return res.status(400).json({
        success: false,
        error: 'Patient name, blood group, and location are required'
      });
    }
    
    const emergency = await Emergency.create(emergencyData);
    
    // Find nearby donors
    const { coordinates } = emergencyData.location;
    const nearbyDonors = await Donor.find({
      bloodGroup: emergencyData.bloodGroup,
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: coordinates
          },
          $maxDistance: 20 * 1000 // 20km radius
        }
      }
    }).limit(10);
    
    // Add donors as potential responders
    const responders = nearbyDonors.map(donor => ({
      donorId: donor._id,
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      phone: donor.phone,
      status: 'pending',
      distance: calculateDistance(
        coordinates[1], // lat
        coordinates[0], // lng
        donor.location.coordinates[1],
        donor.location.coordinates[0]
      )
    }));
    
    emergency.responders = responders;
    await emergency.save();
    
    // Send notifications to nearby donors
    for (const donor of nearbyDonors) {
      await Notification.create({
        userId: donor.userId,
        type: 'emergency_alert',
        title: 'Emergency Blood Request',
        message: `Urgent need for ${emergencyData.bloodGroup} blood near your location`,
        data: {
          emergencyId: emergency._id,
          distance: calculateDistance(
            coordinates[1],
            coordinates[0],
            donor.location.coordinates[1],
            donor.location.coordinates[0]
          ),
          patientName: emergencyData.patientName
        },
        priority: 'critical',
        actionUrl: `/emergency/${emergency._id}`
      });
    }
    
    // Send notification to user
    await Notification.create({
      userId,
      type: 'system',
      title: 'Emergency Activated',
      message: 'Emergency mode activated. Nearby hospitals and donors have been alerted.',
      priority: 'high'
    });
    
    // Emit socket event for real-time updates
    req.io.emit('new-emergency', {
      emergencyId: emergency._id,
      location: emergency.location,
      bloodGroup: emergency.bloodGroup
    });
    
    res.status(201).json({
      success: true,
      message: 'Emergency activated successfully',
      data: emergency
    });
  } catch (error) {
    console.error('Error creating emergency:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Update emergency status
exports.updateEmergency = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { status, ambulanceDetails, responderStatus } = req.body;
    const userId = req.user.id;
    
    const updateData = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'completed' || status === 'cancelled') {
        updateData.resolvedAt = Date.now();
      }
    }
    
    if (ambulanceDetails) {
      updateData.ambulanceDetails = ambulanceDetails;
      updateData.isAmbulanceDispatched = true;
    }
    
    if (responderStatus && req.body.donorId) {
      // Update specific responder status
      const emergency = await Emergency.findById(emergencyId);
      const responder = emergency.responders.id(req.body.donorId);
      
      if (responder) {
        responder.status = responderStatus;
        await emergency.save();
      }
    }
    
    updateData.updatedAt = Date.now();
    
    const emergency = await Emergency.findByIdAndUpdate(
      emergencyId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: 'Emergency not found'
      });
    }
    
    // Create notification for status update
    if (status) {
      await Notification.create({
        userId: emergency.userId,
        type: 'system',
        title: `Emergency ${status}`,
        message: `Your emergency has been marked as ${status}`,
        priority: 'high'
      });
    }
    
    res.json({
      success: true,
      message: 'Emergency updated successfully',
      data: emergency
    });
  } catch (error) {
    console.error('Error updating emergency:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Get user emergencies
exports.getUserEmergencies = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { userId };
    
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const emergencies = await Emergency.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Emergency.countDocuments(query);
    
    res.json({
      success: true,
      count: emergencies.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: emergencies
    });
  } catch (error) {
    console.error('Error fetching emergencies:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Get emergency by ID
exports.getEmergency = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    
    const emergency = await Emergency.findById(emergencyId)
      .populate('userId', 'name phone email')
      .populate('responders.donorId', 'name phone bloodGroup');
    
    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: 'Emergency not found'
      });
    }
    
    res.json({
      success: true,
      data: emergency
    });
  } catch (error) {
    console.error('Error fetching emergency:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Respond to emergency (for donors)
exports.respondToEmergency = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const donorId = req.user.donorProfile;
    
    if (!donorId) {
      return res.status(400).json({
        success: false,
        error: 'User is not registered as a donor'
      });
    }
    
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: 'Emergency not found'
      });
    }
    
    // Find the responder
    const responder = emergency.responders.find(r => 
      r.donorId && r.donorId.toString() === donorId.toString()
    );
    
    if (!responder) {
      return res.status(404).json({
        success: false,
        error: 'Not invited to respond to this emergency'
      });
    }
    
    // Update responder status
    responder.status = action === 'accept' ? 'accepted' : 'rejected';
    
    // If accepted, update donor availability
    if (action === 'accept') {
      await Donor.findByIdAndUpdate(donorId, {
        isAvailable: false
      });
      
      // Notify emergency creator
      await Notification.create({
        userId: emergency.userId,
        type: 'donor_request',
        title: 'Donor Responded',
        message: `${req.user.name} has accepted your emergency request`,
        priority: 'high'
      });
    }
    
    await emergency.save();
    
    res.json({
      success: true,
      message: `Emergency response recorded: ${action}`,
      data: { status: responder.status }
    });
  } catch (error) {
    console.error('Error responding to emergency:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}