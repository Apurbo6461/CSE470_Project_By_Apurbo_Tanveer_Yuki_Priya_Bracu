require('dotenv').config();
const connectDB = require('./config/db');
const Donor = require('./models/Donor');
const Notification = require('./models/Notification');
const Review = require('./models/Review');

const donors = [
  { name: 'Alex Johnson', bloodGroup: 'O+', distance: 1.2, available: true, lat: 23.811, lng: 90.413 },
  { name: 'Maria Garcia', bloodGroup: 'A-', distance: 2.5, available: true, lat: 23.809, lng: 90.411 },
  { name: 'David Smith', bloodGroup: 'B+', distance: 3.1, available: true, lat: 23.812, lng: 90.415 },
  { name: 'Lisa Wang', bloodGroup: 'AB+', distance: 4.3, available: false, lat: 23.808, lng: 90.410 },
  { name: 'Robert Kim', bloodGroup: 'O-', distance: 5.0, available: true, lat: 23.814, lng: 90.409 }
];

const notifications = [
  { title: 'Appointment Reminder', message: 'You have an appointment with Dr. Smith in 1 hour', time: '10:30 AM', read: false },
  { title: 'Blood Request', message: 'Urgent blood needed for O+ at City Hospital', time: '9:45 AM', read: false },
  { title: 'Emergency Alert', message: 'Emergency mode activated in your area', time: '9:15 AM', read: true }
];

const reviews = [
  { name: 'Michael Brown', rating: 5, date: '2023-10-15', comment: 'Excellent service! The doctor was very professional and caring.', pros: 'Professional staff', cons: 'Long waiting time' },
  { name: 'Sarah Johnson', rating: 4, date: '2023-10-10', comment: 'Good experience overall. The hospital was clean and well-organized.', pros: 'Clean facilities', cons: 'Parking was difficult' },
  { name: 'James Wilson', rating: 5, date: '2023-10-05', comment: 'LifeLink saved my life during an emergency. The response time was amazing!', pros: 'Fast emergency response', cons: 'None' }
];

(async function seed(){
  await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/lifelink');
  await Donor.deleteMany({});
  await Notification.deleteMany({});
  await Review.deleteMany({});

  await Donor.insertMany(donors);
  await Notification.insertMany(notifications);
  await Review.insertMany(reviews);

  console.log('Seeding done');
  process.exit(0);
})();