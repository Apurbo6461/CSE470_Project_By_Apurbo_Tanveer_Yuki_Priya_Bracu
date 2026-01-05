# LifeLink Setup Instructions

## Fixed Issues

All errors have been fixed:

1. **Port Mismatches**: Fixed all port references from 5000 to 5001 to match backend
2. **Missing Dependencies**: Added axios to frontend package.json
3. **API Endpoints**: Fixed endpoint mismatches and parameter names
4. **Socket.IO**: Fixed Socket.IO connection ports in App.js and SocketContext.js
5. **MongoDB**: Made MongoDB connection optional (app works without it using in-memory data)

## Running the Application

### Backend (Port 5001)
```bash
cd backend
npm install  # Already done
npm start
```

The backend will run on http://localhost:5001

### Frontend (Port 3000)
```bash
cd frontend
npm install  # Already done
npm start
```

The frontend will run on http://localhost:3000 and automatically open in your browser.

## API Endpoints

- `GET /` - API status and available endpoints
- `GET /api/donors` - Get all donors
- `GET /api/donors/nearby?lat=23.8103&lng=90.4125&radius=10` - Get nearby donors
- `PATCH /api/donors/:id/availability` - Update donor availability
- `POST /api/emergencies` - Create emergency
- `GET /api/emergencies` - Get all emergencies
- `GET /api/feedback` - Get feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/notifications` - Get notifications

## Notes

- MongoDB is optional - the app uses in-memory mock data if MongoDB is not available
- Socket.IO is configured for real-time updates
- All CORS settings are configured for local development

