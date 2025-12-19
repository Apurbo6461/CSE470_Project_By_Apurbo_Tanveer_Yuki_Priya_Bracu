const express = require('express');
const router = express.Router();
const Accident = require('../models/Accident');

// POST /api/accidents
router.post('/', async (req, res) => {
  try {
    const newAccident = await Accident.create(req.body);
    
    if (req.io) {
      req.io.emit('new_accident_reported', newAccident);
    }

    res.status(201).json(newAccident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/accidents (With Search and Sort)
router.get('/', async (req, res) => {
  try {
    const { location, sort } = req.query;
    let query = {};
    
    if (location) {
      query.location = { $regex: location, $options: 'i' }; 
    }

    const accidents = await Accident.find(query)
      .sort(sort === 'severity' ? { severity: -1 } : { createdAt: -1 });

    res.json(accidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await Accident.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          // Change format to YYYY-MM-DD for wider compatibility
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by date
    ]);

    // Map the dates to short names (Mon, Tue, etc.) for the frontend
    const formattedStats = stats.map(item => {
      const date = new Date(item._id);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        day: dayName,
        count: item.count
      };
    });

    res.json(formattedStats);
  } catch (error) {
    console.error("Stats Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;