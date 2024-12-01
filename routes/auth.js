import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getDb } from "../database.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";



// Register Route
router.post("/register", async (req, res) => {
//   const { email, password, name } = req.body;

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

  try {

    const db = getDb();
    const usersCollection = db.collection("user");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    await usersCollection.insertOne({ email, password: hashedPassword, name });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = getDb();
    const usersCollection = db.collection("user");

    // Find the user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user._id,
        email: user.email }, JWT_SECRET, { expiresIn: "3h" });

    // Set the token as an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Set to true in production for HTTPS
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout Route
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: " Logged out successfully" });
});

export default router;
