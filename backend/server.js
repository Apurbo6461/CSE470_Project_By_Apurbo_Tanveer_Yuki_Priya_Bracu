const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH"]
  }
});

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  req.io = io;
  next();
});

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // Give up after 5 seconds instead of 10
})
  .then(() => console.log("🚀 SUCCESS: Database is now live!"))
  .catch(err => {
    console.log("❌ DATABASE ERROR: ", err.message);
    if (err.message.includes("whitelist")) {
      console.log("👉 ACTION REQUIRED: Check your MongoDB Atlas IP Whitelist.");
    }
  });

app.get("/", (req, res) => {
  res.send("Backend running with MongoDB and WebSockets");
});

// Routes
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/accidents", require("./routes/accidentRoutes"));


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});