const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const User = require("../models/user.js");

// View profile
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(400).json({ error: err.message });
  }
});

// Edit profile
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const updates = req.body;

    // Validate gender only if provided
    if (updates.gender && !["male", "female", "others"].includes(updates.gender.toLowerCase())) {
      return res.status(400).json({ error: "Invalid gender" });
    }

    // Filter and apply updates
    Object.keys(updates).forEach((key) => {
      const value = updates[key];
      if (value !== undefined && value !== null && value !== "") {
        user[key] = value;
      }
    });

    await user.save();

    res.json({
      message: `${user.firstName}, your profile was updated successfully`,
      data: user,
    });
  } catch (err) {
    console.error("Error editing the profile:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = profileRouter;
