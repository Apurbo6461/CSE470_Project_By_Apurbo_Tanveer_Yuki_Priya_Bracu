// Donor search route (routes/donors.js)
const express = require('express');
const router = express.Router();
const Donor = require('../models/BloodDonor');

// Search for donors by blood group and location (using geospatial queries)
router.get('/search', async (req, res) => {
  const { bloodGroup, latitude, longitude } = req.query;
  try {
    const donors = await Donor.find({
      bloodGroup,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: 10000, // Distance in meters (e.g., 10km)
        },
      },
    });
    res.status(200).json({ donors });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donors', error });
  }
});

module.exports = router;
