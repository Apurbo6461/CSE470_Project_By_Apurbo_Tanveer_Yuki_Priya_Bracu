# Lifelink Patient Management (MERN MVC Demo)

This is a small MERN-stack conversion of the provided single-file demo. It keeps the same features (form, file attachments, preview, patient ID generation) and organizes the app using an MVC structure.

Quick start

- Install backend deps:

```
npm install
```

- Start backend (dev with nodemon):

```
npm run dev
```

- In a second terminal, start the client:

```
cd client
npm install
npm run dev
```

By default the backend runs on `http://localhost:5000` and the client Vite dev server runs on `http://localhost:5173` (CORS enabled).

API
- POST `/api/patients` accepts `multipart/form-data` with field names: `name`, `sex`, `age`, `phone`, `email`, `address`, and file inputs under `historyFiles` (multiple allowed). Returns the saved patient JSON including generated `patientId` and file URLs under `/uploads`.