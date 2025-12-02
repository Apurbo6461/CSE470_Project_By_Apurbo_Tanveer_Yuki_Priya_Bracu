import mongoose from 'mongoose';

// Define a simple user schema for MongoDB
const userSchema = new mongoose.Schema({
  name: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export async function listUsers() {
  return await User.find({}).lean();
}

export async function addUser(user) {
  const u = new User(user);
  await u.save();
  return u.toObject();
}
