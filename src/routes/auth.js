const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation.js");
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const validator = require("validator");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { password, firstName, lastName, emailId, about, skills, age, photoUrl } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      about,
      skills,
      age,
      photoUrl,
     //    password,
      password: passwordHash, // store hashed password
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return res.json({ message: "User added successfully", data: savedUser });
  } catch (err) {
    console.error("Error adding the user:", err);
    return res.status(400).json({ error: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      return res.status(400).json({ error: "Enter a valid email" });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials!" });
    }

    const isPasswordCorrect = await user.validatePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Invalid credentials!" });
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({ message: "Login successful", data: user });
  } catch (err) {
    console.error("Error logging in the user:", err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(0),
  });

  return res.json({ message: "Logged out successfully" });
});

module.exports = authRouter;
