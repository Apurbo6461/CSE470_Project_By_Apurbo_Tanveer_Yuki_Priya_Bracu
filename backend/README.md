# Backend — LifeLink

Small Express + Mongoose API used by the frontend.

Quick run instructions (local dev):

1. Make sure MongoDB is running locally (the server connects to mongodb://localhost:27017/lifelink by default).
2. Install dependencies and start the server:

```bash
cd backend
npm install
npm start   # runs node server.js (reads PORT from .env, default 5001)
```

If you don't want to use `.env`, also possible:

```bash
PORT=5001 node server.js
```

API endpoints (core):

- GET /api/patients  → { success: true, data: [patients] }
- POST /api/patients → create a patient (returns 201 + { success: true, data: patient })

Keep responses in the envelope { success, data, error? } — the frontend expects this structure.
