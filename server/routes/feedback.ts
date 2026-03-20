import express from "express";
import jwt from "jsonwebtoken";
import { Feedback } from "../models/index";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

router.post("/", verifyToken, async (req: any, res: any) => {
  try {
    const { category, comments, rating } = req.body;
    const feedback = await Feedback.create({
      userId: req.user.userId,
      category,
      comments,
      rating,
    });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

router.get("/", verifyToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

export default router;
