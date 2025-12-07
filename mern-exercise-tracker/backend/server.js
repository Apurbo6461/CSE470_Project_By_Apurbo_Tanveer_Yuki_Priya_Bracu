const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// // Connect Routes
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");

app.use("/auth", authRoutes);      // << REQUIRED
app.use("/api", testRoutes);       // << REQUIRED


// FIXED ROUTE
app.get("/api/notes", (req, res) => {
  res.status(200).send("You got 2000 notes");
});

// Connect to MongoDB
mongoose.connect(process.env.ATLAS_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});