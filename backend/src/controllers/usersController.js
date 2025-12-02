// Controller will use MongoDB model when MONGODB_URI is set and a connection exists,
// otherwise we fall back to the simple in-memory model.
import * as memModel from '../models/usersModel.js';

async function usingMongo() {
  // We decide based on environment variable; server.js sets up mongoose when present.
  return !!process.env.MONGODB_URI;
}

export async function getUsers(req, res) {
  if (await usingMongo()) {
    const mongo = await import('../models/userModelMongo.js');
    const list = await mongo.listUsers();
    return res.json({ success: true, data: list });
  }

  const list = memModel.listUsers();
  return res.json({ success: true, data: list });
}

export async function createUser(req, res) {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ success: false, error: 'name required' });

  if (await usingMongo()) {
    const mongo = await import('../models/userModelMongo.js');
    const u = await mongo.addUser({ name });
    return res.status(201).json({ success: true, data: u });
  }

  const u = memModel.addUser({ name });
  return res.status(201).json({ success: true, data: u });
}
