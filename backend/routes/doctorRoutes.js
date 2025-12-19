const express = require("express");
const Doctor = require("../models/Doctor");
const router = express.Router();

/**
 * FR-7: Create Doctor Profile
 * Used when a new doctor registers
 */
router.post("/", async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * FR-7 (Extended): Update Full Doctor Profile
 * This handles the "Sync to Profile" button for all fields
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body, 
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(updatedDoctor);
  } catch (error) {
    console.error("Profile Sync Error:", error.message);
    res.status(400).json({ error: error.message });
  }
});

/**
 * FR-8: Update Doctor Availability
 * Specifically for the availability toggle or schedule
 */
router.put("/:id/availability", async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { availability: req.body.availability },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET: Fetch Doctor Data
 * Used to populate the dashboard when the page loads
 */
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET: Fetch All Doctors (Optional)
 * Useful for debugging or listing doctors
 */
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;