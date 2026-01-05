const Donor = require('../models/Donor');
const User = require('../models/user');
const Notification = require('../models/Notification');

// Get all donors with filters
exports.getDonors = async (req, res) => {
  try {
    const { 
      bloodGroup, 
      distance, 
      lat, 
      lng, 
      available, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = {};
    
    // Filter by blood group
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }
    
    // Filter by availability
    if (available !== undefined) {
      query.isAvailable = available === 'true';
    }
    
    // Location-based filtering
    if (lat && lng && distance) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(distance) * 1000 // Convert km to meters
        }
      };
    }
    
    const skip = (page - 1) * limit;
    
    const donors = await Donor.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ isAvailable: -1, rating: -1 });
    
    const total = await Donor.countDocuments(query);
    
    res.json({
      success: true,
      count: donors.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: donors
    });
  } catch (error) {
    console.error('Error fetching donors:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Get nearby donors
exports.getNearbyDonors = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius in km
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    
    const donors = await Donor.find({
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    }).limit(20);
    
    // Calculate distance for each donor
    const donorsWithDistance = donors.map(donor => {
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        donor.location.coordinates[1],
        donor.location.coordinates[0]
      );
      
      return {
        ...donor.toObject(),
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal
      };
    });
    
    res.json({
      success: true,
      count: donorsWithDistance.length,
      data: donorsWithDistance
    });
  } catch (error) {
    console.error('Error fetching nearby donors:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Update donor availability
exports.updateAvailability = async (req, res) => {
  try {
    const { donorId } = req.params;
    const { isAvailable, location } = req.body;
    const userId = req.user.id;
    
    // Check if user owns this donor profile
    const user = await User.findById(userId);
    if (!user || user.donorProfile.toString() !== donorId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this donor profile'
      });
    }
    
    const updateData = {};
    
    if (isAvailable !== undefined) {
      updateData.isAvailable = isAvailable;
      
      // If becoming available, update location if provided
      if (isAvailable && location) {
        updateData.location = {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        };
      }
    }
    
    if (location && !isAvailable) {
      updateData.location = {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      };
    }
    
    updateData.updatedAt = Date.now();
    
    const donor = await Donor.findByIdAndUpdate(
      donorId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        error: 'Donor not found'
      });
    }
    
    // Create notification for availability change
    if (isAvailable !== undefined) {
      await Notification.create({
        userId,
        type: 'system',
        title: 'Availability Updated',
        message: `Your donor status has been updated to ${isAvailable ? 'Available' : 'Unavailable'}`,
        isRead: false
      });
    }
    
    // Emit socket event for real-time updates
    req.io.emit('donor-update', {
      donorId: donor._id,
      isAvailable: donor.isAvailable,
      location: donor.location
    });
    
    res.json({
      success: true,
      message: `Availability updated to ${donor.isAvailable ? 'Available' : 'Unavailable'}`,
      data: donor
    });
  } catch (error) {
    console.error('Error updating donor availability:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Register as donor
exports.registerDonor = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user already has a donor profile
    const user = await User.findById(userId);
    if (user.donorProfile) {
      return res.status(400).json({
        success: false,
        error: 'User already has a donor profile'
      });
    }
    
    // Create donor profile
    const donorData = {
      ...req.body,
      userId
    };
    
    const donor = await Donor.create(donorData);
    
    // Update user with donor profile reference
    user.donorProfile = donor._id;
    user.isDonor = true;
    await user.save();
    
    // Create welcome notification
    await Notification.create({
      userId,
      type: 'system',
      title: 'Donor Registration Complete',
      message: 'Welcome to LifeLink donor network! Your profile is now active.',
      isRead: false
    });
    
    res.status(201).json({
      success: true,
      message: 'Donor registration successful',
      data: donor
    });
  } catch (error) {
    console.error('Error registering donor:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
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