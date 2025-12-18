const express = require("express");
const Blood = require("../models/Blood");
const authVerify = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

/* PUBLIC: create request */
router.post("/", async (req, res) => {
  const donor = new Blood(req.body);
  await donor.save();
  res.status(201).json(donor);
});

/* ADMIN: get ALL requests (NO FILTER) */
router.get("/admin", authVerify, allowRoles("admin"), async (req, res) => {
  const requests = await Blood.find();
  console.log("TOTAL BLOOD RECORDS:", requests.length);
  res.json(requests);
});

/* ADMIN: approve */
router.patch(
  "/admin/:id/approve",
  authVerify,
  allowRoles("admin"),
  async (req, res) => {
    await Blood.findByIdAndUpdate(req.params.id, { status: "approved" });
    res.json({ message: "Approved" });
  }
);

/* ADMIN: reject */
router.patch(
  "/admin/:id/reject",
  authVerify,
  allowRoles("admin"),
  async (req, res) => {
    await Blood.findByIdAndUpdate(req.params.id, { status: "rejected" });
    res.json({ message: "Rejected" });
  }
);

module.exports = router;
