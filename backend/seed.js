import 'dotenv/config';
import mongoose from 'mongoose';
import Department from './src/models/Department.js';
import Doctor from './src/models/Doctor.js';

const departments = [
  { name: "Cardiology", icon: "bi-heart-pulse", color: "cardiology", description: "Heart and cardiovascular system" },
  { name: "Neurology", icon: "bi-brain", color: "neurology", description: "Brain and nervous system" },
  { name: "Orthopedics", icon: "bi-bone", color: "orthopedics", description: "Bones, joints, and muscles" },
  { name: "Gynaecology", icon: "bi-gender-female", color: "gynaecology", description: "Women's reproductive health" },
  { name: "Pediatrics", icon: "bi-emoji-smile", color: "pediatrics", description: "Children's health" },
  { name: "Dermatology", icon: "bi-droplet", color: "dermatology", description: "Skin, hair, and nails" },
  { name: "Oncology", icon: "bi-clipboard-pulse", color: "oncology", description: "Cancer diagnosis and treatment" },
  { name: "Psychiatry", icon: "bi-activity", color: "psychiatry", description: "Mental health and disorders" },
  { name: "Urology", icon: "bi-droplet-half", color: "urology", description: "Urinary system and male reproductive" },
  { name: "Ophthalmology", icon: "bi-eye", color: "ophthalmology", description: "Eyes and vision" }
];

const doctors = [
  { name: "Dr. Amit Sharma", department: "Cardiology", specialization: "Interventional Cardiologist", experience: "12 years", fee: 1500, rating: 4.8, availability: ["Mon", "Wed", "Fri"], qualifications: "DM Cardiology, MD Medicine", phone: "9876543210", email: "amit.sharma@hospital.com" },
  { name: "Dr. Priya Reddy", department: "Cardiology", specialization: "Cardiac Electrophysiologist", experience: "9 years", fee: 1200, rating: 4.6, availability: ["Tue", "Thu", "Sat"], qualifications: "DM Cardiology, MD", phone: "9876543211", email: "priya.reddy@hospital.com" },
  { name: "Dr. Rajesh Khanna", department: "Cardiology", specialization: "Preventive Cardiologist", experience: "15 years", fee: 1800, rating: 4.9, availability: ["Mon", "Tue", "Wed", "Thu", "Fri"], qualifications: "DM, FACC", phone: "9876543212", email: "rajesh.khanna@hospital.com" },
  { name: "Dr. Sneha Verma", department: "Neurology", specialization: "Neurologist", experience: "14 years", fee: 1600, rating: 4.7, availability: ["Mon", "Wed", "Fri", "Sat"], qualifications: "DM Neurology, MD", phone: "9876543213", email: "sneha.verma@hospital.com" },
  { name: "Dr. Anil Kapoor", department: "Neurology", specialization: "Neurosurgeon", experience: "18 years", fee: 2500, rating: 4.9, availability: ["Tue", "Thu"], qualifications: "MCh Neurosurgery, MS", phone: "9876543214", email: "anil.kapoor@hospital.com" },
  { name: "Dr. Meera Patel", department: "Neurology", specialization: "Pediatric Neurologist", experience: "10 years", fee: 1400, rating: 4.5, availability: ["Mon", "Wed", "Fri"], qualifications: "DM Pediatric Neurology", phone: "9876543215", email: "meera.patel@hospital.com" },
  { name: "Dr. Rajesh Kumar", department: "Orthopedics", specialization: "Orthopedic Surgeon", experience: "18 years", fee: 2000, rating: 4.8, availability: ["Mon", "Wed", "Thu", "Sat"], qualifications: "MS Ortho, DNB", phone: "9876543216", email: "rajesh.kumar@hospital.com" },
  { name: "Dr. Sunil Gupta", department: "Orthopedics", specialization: "Joint Replacement Surgeon", experience: "20 years", fee: 3000, rating: 4.9, availability: ["Tue", "Fri"], qualifications: "MCh Ortho, FRCS", phone: "9876543217", email: "sunil.gupta@hospital.com" },
  { name: "Dr. Anita Desai", department: "Orthopedics", specialization: "Sports Medicine Specialist", experience: "12 years", fee: 1500, rating: 4.6, availability: ["Mon", "Thu", "Sat"], qualifications: "MS Ortho, Sports Medicine", phone: "9876543218", email: "anita.desai@hospital.com" },
  { name: "Dr. Joyesree Roy", department: "Gynaecology", specialization: "Gynaecologist & Obstetrician", experience: "15 years", fee: 1200, rating: 4.7, availability: ["Mon", "Wed", "Fri", "Sat"], qualifications: "MD, DGO", phone: "9876543219", email: "joyesree.roy@hospital.com" },
  { name: "Dr. Priya Patel", department: "Pediatrics", specialization: "Pediatrician", experience: "10 years", fee: 1000, rating: 4.6, availability: ["Mon", "Tue", "Wed", "Thu", "Fri"], qualifications: "MD Pediatrics", phone: "9876543222", email: "priya.patel@hospital.com" },
  { name: "Dr. Rohit Malhotra", department: "Dermatology", specialization: "Dermatologist & Cosmetologist", experience: "9 years", fee: 1200, rating: 4.5, availability: ["Mon", "Wed", "Fri", "Sat"], qualifications: "MD Dermatology", phone: "9876543225", email: "rohit.malhotra@hospital.com" },
  { name: "Dr. Vikram Singh", department: "Oncology", specialization: "Medical Oncologist", experience: "16 years", fee: 2000, rating: 4.8, availability: ["Mon", "Wed", "Fri"], qualifications: "DM Oncology", phone: "9876543227", email: "vikram.singh@hospital.com" },
  { name: "Dr. Arjun Menon", department: "Psychiatry", specialization: "Psychiatrist", experience: "13 years", fee: 1500, rating: 4.6, availability: ["Mon", "Wed", "Fri"], qualifications: "MD Psychiatry", phone: "9876543229", email: "arjun.menon@hospital.com" },
  { name: "Dr. Sanjay Verma", department: "Urology", specialization: "Urologist", experience: "17 years", fee: 1800, rating: 4.8, availability: ["Mon", "Wed", "Fri"], qualifications: "MCh Urology", phone: "9876543231", email: "sanjay.verma@hospital.com" },
  { name: "Dr. Sameer Joshi", department: "Ophthalmology", specialization: "Ophthalmologist", experience: "15 years", fee: 1200, rating: 4.7, availability: ["Mon", "Wed", "Fri", "Sat"], qualifications: "MS Ophthalmology", phone: "9876543233", email: "sameer.joshi@hospital.com" }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Department.deleteMany({});
    await Doctor.deleteMany({});
    console.log('Cleared existing data');

    // Seed departments
    await Department.insertMany(departments);
    console.log('Departments seeded');

    // Seed doctors
    await Doctor.insertMany(doctors);
    console.log('Doctors seeded');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
