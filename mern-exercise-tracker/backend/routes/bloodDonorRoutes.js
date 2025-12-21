
const express = require('express');
// const Blood = require('../models/Blood');
const router = express.Router();
const Blood = require('../models/Blood'); // adjust filename if different
router.get('/verified-donors', async (req, res) => {
  try {
    // Query for both verified and approved donors
    const donors = await Blood.find({
      status: { $in: ['verified', 'approved',] }  // Include both verified and approved donors
    });

    if (donors.length === 0) {
      return res.status(404).json({ message: 'No verified or approved donors found' });
    }

    return res.json(donors);  // Return the donors
  } catch (err) {
    console.error('Error fetching verified donors:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});
// PATCH /admin/:id - Admin verify or reject donor offer
router.patch('/admin/:id', async (req, res) => {
  try {
    const { status } = req.body; // expected: 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const donor = await Blood.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!donor) return res.status(404).json({ message: 'Donor not found' });
    res.json(donor);
  } catch (err) {
    console.error('Error updating donor status:', err);
    res.status(500).json({ message: 'Failed to update donor status' });
  }
});

// GET /admin - List all blood requests for admin dashboard
router.get('/admin', async (req, res) => {
  try {
    const bloodRequests = await Blood.find().sort({ createdAt: -1 });
    res.json(bloodRequests);
  } catch (err) {
    console.error('Error fetching blood requests for admin:', err);
    res.status(500).json({ message: 'Failed to fetch blood requests' });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    // Basic validation
    const name = (body.requesterInfo && body.requesterInfo.name) || body.name || '';
    const bloodGroup = (body.bloodGroup || '').toString().trim();
    if (!name) return res.status(400).json({ message: 'Requester name is required' });
    if (!bloodGroup) return res.status(400).json({ message: 'bloodGroup is required' });

    const doc = {
      requesterInfo: {
        name,
        email: (body.requesterInfo && body.requesterInfo.email) || body.email || '',
        phone: (body.requesterInfo && body.requesterInfo.phone) || body.phone || ''
      },
      bloodGroup,
      units: body.units ? Number(body.units) : 1,
      urgency: (body.urgency || 'medium').toString().toLowerCase(),
      message: body.message || '',
      status: 'open'
    };

    // Only attach location if valid coordinates provided OR address provided
    if (body.location && Array.isArray(body.location.coordinates) && body.location.coordinates.length === 2) {
      const coords = body.location.coordinates.map(Number);
      if (!Number.isNaN(coords[0]) && !Number.isNaN(coords[1])) {
        doc.location = { type: 'Point', coordinates: coords };
        if (body.location.address) doc.location.address = String(body.location.address);
      }
    } else if (body.lat != null && body.lng != null) {
      const lng = Number(body.lng);
      const lat = Number(body.lat);
      if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
        doc.location = { type: 'Point', coordinates: [lng, lat] };
        if (body.address) doc.location.address = String(body.address);
      }
    } else if (body.address) {
      // If only address (no coords), include address only (schema allows it now)
      doc.location = { address: String(body.address) };
    }

    const saved = await new Blood(doc).save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('create donor error', err);
    // show validation details to help debugging in dev (remove details in prod)
    return res.status(500).json({ message: 'Server error', detail: err.message, errors: err.errors });
  }

});

module.exports = router;