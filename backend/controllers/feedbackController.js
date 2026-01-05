const Feedback = require('../models/Feedback');
const Emergency = require('../models/Emergency');
const Donor = require('../models/Donor');

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, comment, pros, cons, tags, emergencyId, donorId, isAnonymous } = req.body;
    
    // Validate required fields
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Rating and comment are required'
      });
    }
    
    // Check if feedback already exists for this emergency
    if (emergencyId) {
      const existingFeedback = await Feedback.findOne({ 
        userId, 
        emergencyId 
      });
      
      if (existingFeedback) {
        return res.status(400).json({
          success: false,
          error: 'Feedback already submitted for this emergency'
        });
      }
    }
    
    const feedbackData = {
      userId: isAnonymous ? null : userId,
      rating,
      comment,
      pros: pros ? (Array.isArray(pros) ? pros : [pros]) : [],
      cons: cons ? (Array.isArray(cons) ? cons : [cons]) : [],
      tags: tags || [],
      emergencyId,
      donorId,
      isAnonymous: isAnonymous || false
    };
    
    const feedback = await Feedback.create(feedbackData);
    
    // Update donor rating if feedback is for a donor
    if (donorId) {
      await updateDonorRating(donorId);
    }
    
    // Create notification for system admin
    if (!isAnonymous && donorId) {
      const donor = await Donor.findById(donorId);
      if (donor) {
        // Create notification (in real app, this would go to admin or donor)
        await Notification.create({
          userId: donor.userId,
          type: 'system',
          title: 'New Feedback Received',
          message: `You have received new feedback with ${rating} star rating`,
          priority: 'medium'
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Get feedback with filters
exports.getFeedback = async (req, res) => {
  try {
    const { 
      donorId, 
      emergencyId, 
      minRating, 
      maxRating, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = {};
    
    // Filter by donor
    if (donorId) {
      query.donorId = donorId;
    }
    
    // Filter by emergency
    if (emergencyId) {
      query.emergencyId = emergencyId;
    }
    
    // Filter by rating range
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseInt(minRating);
      if (maxRating) query.rating.$lte = parseInt(maxRating);
    }
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const feedback = await Feedback.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort)
      .populate('userId', 'name avatar')
      .populate('donorId', 'name bloodGroup');
    
    const total = await Feedback.countDocuments(query);
    
    // Calculate average rating
    const averageRating = await Feedback.aggregate([
      { $match: query },
      { $group: { 
        _id: null, 
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }}
    ]);
    
    // Calculate rating distribution
    const ratingDistribution = await Feedback.aggregate([
      { $match: query },
      { $group: { 
        _id: "$rating", 
        count: { $sum: 1 }
      }},
      { $sort: { _id: -1 } }
    ]);
    
    res.json({
      success: true,
      count: feedback.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      averageRating: averageRating[0]?.avgRating || 0,
      totalRatings: averageRating[0]?.count || 0,
      ratingDistribution,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Mark feedback as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    
    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Feedback marked as helpful',
      data: { helpfulCount: feedback.helpfulCount }
    });
  } catch (error) {
    console.error('Error marking feedback as helpful:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Report feedback
exports.reportFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { reason } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { 
        $inc: { reportCount: 1 },
        $push: { reportReasons: reason }
      },
      { new: true }
    );
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Feedback reported successfully',
      data: { reportCount: feedback.reportCount }
    });
  } catch (error) {
    console.error('Error reporting feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Helper function to update donor rating
async function updateDonorRating(donorId) {
  try {
    const result = await Feedback.aggregate([
      { $match: { donorId: mongoose.Types.ObjectId(donorId) } },
      { $group: { 
        _id: "$donorId", 
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }}
    ]);
    
    if (result.length > 0) {
      await Donor.findByIdAndUpdate(donorId, {
        rating: parseFloat(result[0].avgRating.toFixed(1)),
        totalDonations: result[0].totalReviews
      });
    }
  } catch (error) {
    console.error('Error updating donor rating:', error);
  }
}