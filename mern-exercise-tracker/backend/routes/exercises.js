// backend/routes/exercises.js
const express = require('express');
const router = express.Router();

// Sample exercise data or you can replace this with data from the database
const exercises = [
  { name: 'Push-up' },
  { name: 'Squat' },
  { name: 'Lunges' }
];

// GET route to fetch all exercises from the database
router.get('/', (req, res) => {
  res.json(exercises);  // Send the exercises as JSON response
});

module.exports = router;
