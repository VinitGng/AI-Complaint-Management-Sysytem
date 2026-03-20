import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { initSocket } from "./server/socket";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";

import authRoutes from "./server/routes/auth";
import complaintRoutes from "./server/routes/complaints";
import feedbackRoutes from "./server/routes/feedback";
import { User } from "./server/models/index";

import testRoutes from "./server/routes/test";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  try {
    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin"
      });
      console.log("Seeded default admin user: admin@example.com / admin123");
    }

    const studentExists = await User.findOne({ email: "student@example.com" });
    if (!studentExists) {
      const hashedPassword = await bcrypt.hash("student123", 10);
      await User.create({
        name: "Student User",
        email: "student@example.com",
        password: hashedPassword,
        role: "student"
      });
      console.log("Seeded default student user: student@example.com / student123");
    }
  } catch (err) {
    console.error("Failed to seed database:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const httpServer = createServer(app);
  initSocket(httpServer);

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));

  // Connect to MongoDB if URI is provided, else use mock
  const mongoUri = process.env.MONGODB_URI;
  const isValidMongoUri = mongoUri && (mongoUri.startsWith("mongodb://") || mongoUri.startsWith("mongodb+srv://"));

  if (isValidMongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB");
      await seedDatabase();
    } catch (err) {
      console.error("MongoDB connection error:", err);
    }
  } else {
    if (mongoUri) {
      console.warn(`Invalid MONGODB_URI provided: ${mongoUri}. Falling back to in-memory mock database.`);
    } else {
      console.warn("MONGODB_URI not found. Using in-memory mock database for preview.");
    }
    try {
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log("Connected to In-Memory MongoDB");
      await seedDatabase();
    } catch (err) {
      console.error("In-Memory MongoDB connection error:", err);
    }
  }

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/complaints", complaintRoutes);
  app.use("/api/feedback", feedbackRoutes);
  app.use("/api/test", testRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
