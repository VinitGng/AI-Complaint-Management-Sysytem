import express from "express";
import jwt from "jsonwebtoken";
import { Complaint } from "../models/index";
import { GoogleGenAI } from "@google/genai";
import { getIO } from "../socket";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    const { category, locationDetails, description, photoURL, latitude, longitude, timestamp } = req.body;
    const complaintID = `CMP-${Math.floor(100000 + Math.random() * 900000)}`;
    
    let verificationStatus = "PENDING";

    // AI Verification
    if (photoURL && description) {
      try {
        const base64Data = photoURL.split(",")[1];
        const mimeType = photoURL.split(";")[0].split(":")[1];

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              {
                text: `Does this image match the complaint description: "${description}"? Respond with exactly "VALID" if it matches, or "POSSIBLE_FAKE" if it does not match or seems suspicious.`,
              },
            ],
          },
        });
        const aiResult = response.text?.trim().toUpperCase();
        if (aiResult === "VALID" || aiResult === "POSSIBLE_FAKE") {
          verificationStatus = aiResult;
        }
      } catch (aiError) {
        console.error("AI Verification Error:", aiError);
      }
    }

    // Location Verification (Mock campus boundary check)
    // Assuming campus is at lat: 28.6139, lng: 77.2090 with 5km radius
    const campusLat = 28.6139;
    const campusLng = 77.2090;
    const distance = Math.sqrt(Math.pow(latitude - campusLat, 2) + Math.pow(longitude - campusLng, 2));
    if (distance > 0.05) { // Roughly 5km
      verificationStatus = "POSSIBLE_FAKE";
    }

    // Duplicate Complaint Detection
    const duplicate = await Complaint.findOne({
      userId: req.user.userId,
      category,
      description,
      complaintStatus: { $ne: "Resolved" }
    });

    if (duplicate) {
      return res.status(400).json({ error: "A similar complaint is already pending." });
    }

    const complaint = await Complaint.create({
      complaintID,
      category,
      locationDetails,
      description,
      photoURL,
      latitude,
      longitude,
      timestamp,
      verificationStatus,
      userId: req.user.userId,
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit complaint" });
  }
});

router.get("/", verifyToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

router.get("/my-complaints", verifyToken, async (req: any, res: any) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.userId }).sort({ timestamp: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch your complaints" });
  }
});

router.get("/:id", async (req: any, res: any) => {
  try {
    const complaint = await Complaint.findOne({ complaintID: req.params.id });
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaint" });
  }
});

router.put("/:id/status", verifyToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { status } = req.body;
    const complaint = await Complaint.findOneAndUpdate(
      { complaintID: req.params.id },
      { complaintStatus: status },
      { new: true }
    );
    
    if (complaint && complaint.userId) {
      const io = getIO();
      io.to(complaint.userId.toString()).emit("complaint_updated", {
        complaintID: complaint.complaintID,
        complaintStatus: complaint.complaintStatus,
        message: `Your complaint ${complaint.complaintID} status has been updated to ${complaint.complaintStatus}.`
      });
    }
    
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.put("/:id/notes", verifyToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { notes } = req.body;
    const complaint = await Complaint.findOneAndUpdate(
      { complaintID: req.params.id },
      { resolutionNotes: notes },
      { new: true }
    );
    
    if (complaint && complaint.userId) {
      const io = getIO();
      io.to(complaint.userId.toString()).emit("complaint_updated", {
        complaintID: complaint.complaintID,
        resolutionNotes: complaint.resolutionNotes,
        message: `Admin added a note to your complaint ${complaint.complaintID}.`
      });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to update notes" });
  }
});

router.put("/:id/mark-fake", verifyToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const complaint = await Complaint.findOneAndUpdate(
      { complaintID: req.params.id },
      { verificationStatus: "FAKE", complaintStatus: "Rejected" },
      { new: true }
    );
    
    if (complaint && complaint.userId) {
      const io = getIO();
      io.to(complaint.userId.toString()).emit("complaint_updated", {
        complaintID: complaint.complaintID,
        complaintStatus: complaint.complaintStatus,
        verificationStatus: complaint.verificationStatus,
        message: `Your complaint ${complaint.complaintID} has been marked as Fake/Rejected.`
      });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to mark as fake" });
  }
});

export default router;
