// backend/routes/adminRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Assuming User model is already defined
const {authVerify} = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

//  GET all users (Admin only)
router.get("/users", authVerify, allowRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users); // Return all users
  } catch (err) {
    console.error("Error fetching users:", err); // Log the error for debugging
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ POST request to add a new user (Admin only)
router.post("/users", authVerify, allowRoles("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if required fields are provided
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if email already exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists." });

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({ name, email, password: hashedPassword, role });

    // Save the user to the database
    await newUser.save();

    // Return the new user object excluding the password
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ error: "Failed to add user" });
  }
});

// ✅ DELETE a user (Admin only)
router.delete("/users/:id", authVerify, allowRoles("admin"), async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the user exists
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ error: "User not found." });
    }

    // Remove the user
    await User.findByIdAndDelete(userId);

    res.json({ message: "User removed successfully." });
  } catch (err) {
    console.error("Error removing user:", err);
    res.status(500).json({ error: "Failed to remove user." });
  }
});

module.exports = router;
