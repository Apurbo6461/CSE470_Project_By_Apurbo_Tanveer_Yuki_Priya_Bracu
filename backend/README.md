# Backend - Lifelink Patient Management

This folder contains the Express + Mongoose backend.

Start:

```
cd backend
npm install
npm run dev
```

By default the server tries to bind to port `5000`. If that port is already in use the server will automatically try the next available port(s) and log the port it successfully bound to (check the console output).

API
- POST `/api/patients` accepts `multipart/form-data` with fields and `historyFiles` files.
