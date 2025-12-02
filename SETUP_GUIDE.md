# LIFELINK HOSPITAL - MERN Stack Appointment System

## Complete Project Setup Guide

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm/yarn

---

## BACKEND SETUP (Express + MongoDB)

### 1. Install Dependencies
```bash
cd backend
npm install express cors dotenv mongoose
```

### 2. Configure Environment (.env)
```
MONGODB_URI=mongodb://127.0.0.1:27017/hospital_db
PORT=5001
NODE_ENV=development
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Backend Server
```bash
npm start
```
Server runs on `http://localhost:5001`

### API Endpoints

#### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department

#### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors?department=Cardiology` - Filter by department
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Create doctor

#### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments?patientPhone=9876543210` - Filter by patient phone
- `GET /api/appointments/:id` - Get appointment by ID
- `PATCH /api/appointments/:id` - Update appointment status
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/appointments/check-availability?doctorName=Dr. Amit&appointmentDate=2024-12-10&appointmentTime=09:00` - Check slot availability

---

## FRONTEND SETUP (React + Vite)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
App runs on `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
```

---

## Database Schema

### Department
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  icon: String,
  color: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Doctor
```javascript
{
  _id: ObjectId,
  name: String,
  department: String,
  specialization: String,
  experience: String,
  fee: Number,
  rating: Number,
  availability: [String],
  qualifications: String,
  phone: String,
  email: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment
```javascript
{
  _id: ObjectId,
  appointmentId: String,
  patientName: String,
  patientPhone: String,
  patientEmail: String,
  patientAge: Number,
  symptoms: String,
  department: String,
  doctorName: String,
  doctorSpecialization: String,
  appointmentDate: Date,
  appointmentTime: String,
  consultationFee: Number,
  paymentMethod: String, // 'cash' or 'online'
  paymentStatus: String, // 'pending' or 'completed'
  appointmentStatus: String, // 'booked', 'confirmed', 'completed', 'cancelled'
  bookedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Key Features Implemented

### Frontend
✅ Department Selection (Step 1)
✅ Doctor Selection (Step 2)
✅ Date & Time Selection (Step 3)
✅ Payment Method Selection (Step 4)
✅ Appointment Booking Confirmation
✅ View My Appointments
✅ Cancel Appointment
✅ Browse Doctors by Department
✅ Search Doctors
✅ View Departments
✅ Responsive Design

### Backend
✅ RESTful API Endpoints
✅ MongoDB Integration
✅ Slot Availability Checking
✅ Appointment Status Management
✅ Doctor Filtering
✅ CORS Enabled

---

## Testing API with curl

### Get all departments
```bash
curl http://localhost:5001/api/departments
```

### Get all doctors
```bash
curl http://localhost:5001/api/doctors
```

### Get doctors by department
```bash
curl "http://localhost:5001/api/doctors?department=Cardiology"
```

### Create appointment
```bash
curl -X POST http://localhost:5001/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "John Doe",
    "patientPhone": "9876543210",
    "patientEmail": "john@example.com",
    "patientAge": 30,
    "symptoms": "Chest pain",
    "department": "Cardiology",
    "doctorName": "Dr. Amit Sharma",
    "doctorSpecialization": "Interventional Cardiologist",
    "appointmentDate": "2024-12-15",
    "appointmentTime": "10:00",
    "consultationFee": 1500,
    "paymentMethod": "online"
  }'
```

### Get appointments
```bash
curl "http://localhost:5001/api/appointments?patientPhone=9876543210"
```

### Cancel appointment
```bash
curl -X DELETE http://localhost:5001/api/appointments/:appointmentId
```

---

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- For local: `mongodb://127.0.0.1:27017/hospital_db`
- For Atlas: `mongodb+srv://user:password@cluster.mongodb.net/hospital_db`

### CORS Errors
- Backend CORS is configured for ports 5173 (Vite) and 3000 (React)
- Update `server.js` if using different ports

### Port Already in Use
- Backend: `PORT=5002 npm start`
- Frontend: `npm run dev -- --port 5174`

---

## Project Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── Department.js
│   │   ├── Doctor.js
│   │   └── Appointment.js
│   ├── controllers/
│   │   ├── departmentController.js
│   │   ├── doctorController.js
│   │   └── appointmentController.js
│   └── routes/
│       ├── departmentRoutes.js
│       ├── doctorRoutes.js
│       └── appointmentRoutes.js
├── server.js
├── seed.js
├── package.json
└── .env

frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── StepProgress.jsx
│   │   └── tabs/
│   │       ├── BookAppointmentTab.jsx
│   │       ├── MyAppointmentsTab.jsx
│   │       ├── DoctorsTab.jsx
│   │       └── DepartmentsTab.jsx
│   ├── services/
│   │   └── apiService.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── .env
```

---

## Next Steps

1. Start MongoDB service
2. Run `npm run seed` in backend to populate database
3. Start backend: `npm start` (runs on 5001)
4. Start frontend: `npm run dev` (runs on 5173)
5. Open browser: `http://localhost:5173`

---

## Support

For issues or questions, please check:
- Backend logs at `http://localhost:5001/api/health`
- MongoDB connection status
- Frontend console for API errors
- Network tab in browser DevTools

