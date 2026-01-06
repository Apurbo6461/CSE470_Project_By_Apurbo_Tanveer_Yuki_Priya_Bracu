// routes/bloodDonorRequestRoutes.js
const express = require('express');
const router = express.Router();
const BloodDonor = require('../models/BloodDonor');  // Make sure this is imported correctly

// POST route to register a blood donor
router.post('/register', async (req, res) => {
  const { name, bloodGroup, location, contactInfo } = req.body;

  // Log the request body for debugging
  console.log('Request Body:', req.body);

  if (!name || !bloodGroup || !location || !contactInfo) {
    return res.status(400).json({ error: 'All fields are required for blood donor registration' });
  }

  try {
    // Create a new donor with status 'pending'
    const newDonor = new BloodDonor({
      name,
      bloodGroup,
      location,
      contactInfo,
      status: 'pending',  // Set status to 'pending' initially
    });

    // Save to MongoDB
    await newDonor.save();
    console.log('New Donor Saved:', newDonor);  // Log the saved donor for confirmation

    res.status(201).json({
      message: 'Blood donor request submitted successfully, waiting for approval.',
      donor: newDonor,
    });
  } catch (err) {
    console.error('Error saving blood donor request:', err);  // Log error if saving fails
    res.status(500).json({ error: 'Error registering blood donor request' });
  }
});

module.exports = router;
