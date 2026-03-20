import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },
});

const complaintSchema = new mongoose.Schema({
  complaintID: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  locationDetails: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String, required: true },
  photoURL: { type: String }, // Base64 or URL
  latitude: { type: Number },
  longitude: { type: Number },
  timestamp: { type: Date, default: Date.now },
  verificationStatus: { type: String, enum: ["VALID", "POSSIBLE_FAKE", "PENDING", "FAKE"], default: "PENDING" },
  complaintStatus: { type: String, enum: ["Pending", "In Progress", "Resolved", "Rejected"], default: "Pending" },
  resolutionNotes: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: { type: String },
  comments: { type: String },
  rating: { type: Number },
  timestamp: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
export const Complaint = mongoose.model("Complaint", complaintSchema);
export const Feedback = mongoose.model("Feedback", feedbackSchema);
