# Lifelink Patient Management (MERN MVC Demo)

This repository has been cleaned up so the top-level contains only two folders:

- `backend` — Express API and server-side code
- `frontend` — React (Vite) app

Each folder contains its own `package.json` and instructions for running locally.

## Quick start

1. Backend

```bash
cd backend
npm install
npm run dev
```

Backend defaults to `http://localhost:5000`.

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend Vite dev server defaults to `http://localhost:5173` and talks to the backend (`/api/*`).

## Notes

- Uploads and data are stored in `backend/uploads` and `backend/data` by default (file-based storage). To use MongoDB, set the environment variable `STORAGE_MODE=mongodb` and configure `MONGO_URI` in `backend/.env.example`.
- Use `npm run start` in each folder to start the production build where applicable.

If you'd like, I can open a PR for this cleanup branch or merge it directly into `master`.