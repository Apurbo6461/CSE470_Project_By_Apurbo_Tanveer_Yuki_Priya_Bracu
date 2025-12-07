const express = require("express");
const  auth  = require("../middleware/authMiddleware");
const  allowRoles  = require("../middleware/roleMiddleware");

const router = express.Router();

// Only admin can access
router.get("/admin-only", auth, allowRoles("admin"), (req, res) => {
  res.send("Welcome Admin!");
});

// Only doctor + admin
router.get("/doctor-data", auth, allowRoles("doctor", "admin"), (req, res) => {
  res.send("Doctor access approved!");
});

// Only patients
router.get("/patient-info", auth, allowRoles("patient"), (req, res) => {
  res.send("Patient info accessed");
});

// Hospital + admin
router.get("/hospital-dashboard", auth, allowRoles("hospital", "admin"), (req, res) => {
  res.send("Hospital dashboard");
});

// Only donor users
router.get("/donor-info", auth, allowRoles("donor"), (req, res) => {
  res.send("Donor access granted!");
});


module.exports = router;