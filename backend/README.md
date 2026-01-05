# LifeLink Backend

Simple Express + Mongoose API for LifeLink demo.

Setup

1. Copy `.env.example` to `.env` and set `MONGO_URI` (defaults to mongodb://localhost:27017/lifelink)

2. Install dependencies:

   npm install

3. Seed data (optional):

   npm run seed

4. Start dev server:

   npm run dev

API endpoints

- GET /api/donors
- POST /api/donors
- PATCH /api/donors/:id
- GET /api/notifications
- POST /api/notifications
- PUT /api/notifications/:id/read
- PUT /api/notifications/mark-all/read
- GET /api/reviews
- POST /api/reviews

