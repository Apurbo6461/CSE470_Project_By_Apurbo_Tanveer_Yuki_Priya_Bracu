require("dotenv").config(); // Load .env
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI; // reads your URI from .env

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const doctorRoutes = require("./routes/doctorRoutes"); // ADD THIS

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/doctors", doctorRoutes); // ADD THIS

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log(err));