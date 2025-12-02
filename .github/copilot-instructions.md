## Quick orientation — LifeLink (frontend + backend)

This repository is a two-part app: a small Express + Mongoose API in `/backend` and a Create-React-App UI in `/frontend`.

- Backend: `/backend`
  - Express server: `server.js` (see `server.js.save` for a fuller copy). Defines a Patient schema and two endpoints:
    - GET `/api/patients` → { success: true, data: [patients] }
    - POST `/api/patients` → creates a Patient; returns { success: true, data: patient } on 201
  - MongoDB used via mongoose, default connection string in `server.js` is `mongodb://localhost:27017/lifelink`.
  - Port configured via `/backend/.env` (currently PORT=5001). The repo has no `start` script in backend's package.json, so start with `node server.js`.

- Frontend: `/frontend`
  - React app bootstrapped with Create React App, Material UI (MUI) for components.
  - Client code lives in `src/` — the main app is `src/App.js`.
  - `frontend/package.json` has a CRA dev server proxy configured: `"proxy": "http://localhost:5001"`.

Important local gotchas (to surface for AI agents):

- Port mismatch to watch:
  - `backend/.env` sets PORT=5001 (server runs on 5001 by default).
  - `frontend/package.json` proxy is set to 5001 — but `src/App.js` contains hard-coded axios calls to `http://localhost:5000/api/patients`.
    - Effect: frontend dev server will not proxy to backend if `src/App.js` uses absolute URLs on port 5000.
    - Actionable guidance: prefer relative paths (`/api/patients`) in the frontend so CRA proxy works, or change the axios URLs to `http://localhost:5001` to match backend.

- Dependency / lockfile gotcha:
  - Do NOT run `npm audit fix --force` in this project: it can replace packages with broken/wrong versions (we saw `react-scripts` pinned to `0.0.0` after this command).
  - If your local dev server says `react-scripts: command not found`, recover with:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```
  - After recovery, avoid forced audit fixes; run `npm audit` and handle individual deps carefully.

Key data shapes & patterns (discoverable in repository):

- Patient object (example fields used across code)
  - name, age, bloodGroup, phone, email, address, medicalHistory (array of {date,type,doctor,diagnosis}).
  - Backend validates/saves this structure via Mongoose schema in `backend/server.js`.
- API responses follow a lightweight envelope: `{ success: <bool>, data: <object|array>, error?: <string> }`.

Developer workflows & useful commands (explicit):

- Run the backend locally (assumes MongoDB is running locally):
  - cd backend && npm install
  - NODE environment already read from `.env`; start with: `node server.js` (or: `PORT=5001 node server.js` explicitly)

- Run the frontend (CRA):
  - cd frontend && npm install
  - npm start → opens dev server on http://localhost:3000; proxy will forward `/api` to the backend when the frontend uses relative URLs.

- Tests: frontend uses CRA tests: `cd frontend && npm test`. There are no tests configured for backend.

Examples an AI agent should follow when making changes:

- Fixing the port mismatch: update `src/App.js` from `http://localhost:5000/api/patients` to either `/api/patients` or `http://localhost:5001/api/patients` (prefer the relative path for dev-mode proxy).
- When adding API code, keep to existing envelope format (respond object with `success` and `data`) — several UI components expect that shape.

Where to look next (high-value files):
- `/backend/server.js` and `/backend/.env` — API entry points and config
- `/frontend/package.json` — CRA proxy and scripts
- `/frontend/src/App.js` — primary client behavior and axios calls (default fallbacks and forms)

If you'd like, I can either:
- open a PR that fixes the port mismatch in `src/App.js` (two short edits), or
- add a `start` script in `/backend/package.json` and a README snippet with explicit run commands.

If anything here is incomplete or you'd like a different level of detail (more code examples, CI notes, or adding tests), tell me which direction and I’ll update the file.
