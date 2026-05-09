import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./database/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// connect to Database
connectDB();

// middleware
app.use(cors());
app.use(express.json()); // parses incoming JSON requests

// serve static frontend files
app.use(express.static('public')); 

// API Versioning Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// global err handler
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});

app.listen(port, () => {
    console.log(`Serving on port: ${port}`);
});