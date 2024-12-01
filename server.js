import express from "express";
import cookieParser from "cookie-parser";
import { connectToDatabase } from "./database.js";
import authRoutes from "./routes/auth.js"; 
import planRoutes from "./routes/plans.js";
import exerciseRoutes from "./routes/exercise.js"

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(resolve(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

// Log middleware (for debugging)
app.use((req, res, next) => {
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log('Ready for new request...');
    next();
  });

// request logging

app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`);
	next();
});

// Connect to the database
connectToDatabase().catch((err) => {
  console.error("Failed to connect to MongoDB", err);
  process.exit(1); // Exit if the database connection fails
});

// Register routes
app.use("/auth", authRoutes);
app.use("/plan", planRoutes);
app.use("/exercise", exerciseRoutes);

// Default route to home page
app.get('/', (req, res) => {
    res.sendFile(resolve(__dirname, 'public', 'index.html'));
  });

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
