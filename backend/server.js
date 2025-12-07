// LifeLink Backend - Patient Management
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/lifelink")
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB connection error:", err.message));

// Patient Schema
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fullName: { type: String },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  bloodGroup: String,
  phone: { type: String, required: true },
  email: String,
  address: String,
  emergencyContact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { 
      type: String, 
      required: true,
      enum: ['Father', 'Mother', 'Spouse', 'Sibling', 'Child', 'Other', 'Parent']
    }
  },
  createdAt: { type: Date, default: Date.now }
});

const Patient = mongoose.model("Patient", patientSchema);

// Routes
// GET all patients
app.get("/api/patients", async (req, res) => {
  try {
    console.log("📋 GET /api/patients");
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (error) {
    console.error("❌ Error fetching patients:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new patient
app.post("/api/patients", async (req, res) => {
  try {
    console.log("➕ POST /api/patients - New patient data:", req.body);
    
    // Ensure name field exists
    if (req.body.fullName && !req.body.name) {
      req.body.name = req.body.fullName;
    }
    
    const patient = new Patient(req.body);
    await patient.save();
    console.log("✅ Patient saved successfully");
    res.json({ success: true, data: patient });
  } catch (error) {
    console.error("❌ Error saving patient:", error.message);
    res.status(400).json({ 
      success: false, 
      message: error.message,
      errors: error.errors 
    });
  }
});

// PUT update patient
app.put("/api/patients/:id", async (req, res) => {
  try {
    console.log(`✏️ PUT /api/patients/${req.params.id}`);
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: patient });
  } catch (error) {
    console.error("❌ Error updating patient:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("🚀 LifeLink Backend is running!");
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message 
  });
});

// Start server
const PORT = 5001;
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📋 API Endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/patients`);
  console.log(`   POST http://localhost:${PORT}/api/patients`);
  console.log(`   PUT  http://localhost:${PORT}/api/patients/:id`);
  console.log(`   Health: http://localhost:${PORT}/`);
  console.log(`========================================\n`);
});
