const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || '';
  if (!uri) {
    console.warn('No MONGO_URI provided — skipping MongoDB connection (running with in-memory/no DB).');
    return;
  }
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // do not exit — allow server to run without DB for local dev
  }
}

module.exports = { connectDB };
