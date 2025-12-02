import 'dotenv/config';
import mongoose from 'mongoose';
import { addUser } from '../src/models/userModelMongo.js';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set. Copy .env.example to .env and set MONGODB_URI first.');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding.');

    const users = [ { name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' } ];
    for (const u of users) {
      const created = await addUser(u);
      console.log('seeded', created);
    }

    console.log('Seeding finished.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

run();
