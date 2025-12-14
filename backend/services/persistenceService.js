const fs = require('fs');
const path = require('path');
const { STORAGE_MODE } = require('../config/db');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PATIENTS_FILE = path.join(DATA_DIR, 'patients.json');

// Lazy load Patient model to avoid circular dependency
let Patient = null;
const getPatientModel = () => {
  if (!Patient) {
    Patient = require('../models/Patient');
  }
  return Patient;
};

// Lazy check MongoDB connection
const isMongoConnected = () => {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection && mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
};

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Persistence Service - abstraction layer for MongoDB + File storage
 * MVC: Service layer handles all DB/File operations
 */

// Helper: Read patients from JSON file
const readPatientsFromFile = () => {
  try {
    if (!fs.existsSync(PATIENTS_FILE)) return [];
    const raw = fs.readFileSync(PATIENTS_FILE, 'utf8');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading patients file:', err);
    return [];
  }
};

// Helper: Write patients to JSON file
const writePatientsToFile = (patients) => {
  try {
    fs.writeFileSync(PATIENTS_FILE, JSON.stringify(patients, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing patients file:', err);
    throw err;
  }
};

// Save a patient
const savePatient = async (patientData) => {
  if (STORAGE_MODE === 'mongodb' && isMongoConnected()) {
    const Patient = getPatientModel();
    const patient = new Patient(patientData);
    await patient.save();
    return patient.toObject();
  } else {
    // Use file storage
    const patients = readPatientsFromFile();
    patients.push(patientData);
    writePatientsToFile(patients);
    return patientData;
  }
};

// Get patient by ID
const getPatientById = async (patientId) => {
  if (STORAGE_MODE === 'mongodb' && isMongoConnected()) {
    const Patient = getPatientModel();
    return await Patient.findOne({ patientId }).lean();
  } else {
    const patients = readPatientsFromFile();
    return patients.find(p => p.patientId === patientId) || null;
  }
};

// List all patients
const listPatients = async () => {
  if (STORAGE_MODE === 'mongodb' && isMongoConnected()) {
    const Patient = getPatientModel();
    return await Patient.find().sort({ createdAt: -1 }).lean();
  } else {
    const patients = readPatientsFromFile();
    return patients.reverse();
  }
};

module.exports = {
  savePatient,
  getPatientById,
  listPatients
};
