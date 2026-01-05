# LifeLink (MERN demo)

This workspace contains a minimal MERN (MongoDB, Express, React, Node) implementation of the LifeLink UI you provided.

Structure

- backend/ - Express + Mongoose API
- frontend/ - Vite + React UI
- docker-compose.yml - runs MongoDB

Quick start (macOS)

1) Start MongoDB (using Docker):

   docker compose up -d

2) Backend

   cd backend
   npm install
   cp .env.example .env # (optionally edit MONGO_URI)
   npm run seed   # optional, seeds sample data
   npm run dev

3) Frontend

   cd frontend
   npm install
   cp .env.example .env # (set VITE_API_URL if your backend runs elsewhere)
   npm run dev

Open the Vite URL (usually http://localhost:5173) and the backend (http://localhost:5000) to check the API.

Notes

- The backend API endpoints are documented in `backend/README.md`.
- If you don't want to use Docker, run a MongoDB instance locally and set `MONGO_URI` accordingly.
