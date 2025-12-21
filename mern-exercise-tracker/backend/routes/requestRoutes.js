const express = require('express');
const BloodRequest = require('../models/BloodRequest');
const auth = require('../middleware/authMiddleware'); // optional, if you want login-only; see notes
const allowRoles = require('../middleware/roleMiddleware'); // optional
const router = express.Router();

/**
 * POST /api/requests
 * Body: { bloodGroup, lat, lng, units, message, urgency, contactPhone, contactEmail, requesterInfo }
 * requesterInfo (optional) = { patientId, name, email, phone } — provided by frontend when verified session exists
 *
 * If the user is authenticated, we set requesterUser and prefer req.user info.
 */
router.post('/', async (req, res) => {
  try {
    const { bloodGroup, lat, lng, units = 1, message, urgency = 'medium', contactPhone, contactEmail, requesterInfo } = req.body;

    if (!bloodGroup || lat == null || lng == null) {
      return res.status(400).json({ message: 'bloodGroup and lat/lng are required' });
    }

    // Build requester data
    const requesterData = {
      patientId: '',
      name: '',
      email: '',
      phone: ''
    };

    // If logged-in user is present (you may choose to require auth by uncommenting auth middleware)
    if (req.user) {
      requesterData.name = req.user.name || '';
      requesterData.email = req.user.email || '';
      requesterData.phone = req.user.phone || '';
    } else if (requesterInfo && requesterInfo.name) {
      // fallback to provided verified patient info from client session
      requesterData.patientId = requesterInfo.patientId || '';
      requesterData.name = requesterInfo.name || '';
      requesterData.email = requesterInfo.email || '';
      requesterData.phone = requesterInfo.phone || '';
    } else {
      return res.status(400).json({ message: 'Requester information is required (login or provide verified patient info)' });
    }

    const location = { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] };

    const doc = new BloodRequest({
      requesterUser: req.user ? req.user._id : undefined,
      requesterInfo: requesterData,
      contactPhone,
      contactEmail,
      bloodGroup,
      units,
      message,
      urgency,
      location
    });

    await doc.save();
    return res.status(201).json(doc);
  } catch (err) {
    console.error('Create request error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;