import express from "express";

const router = express.Router();
router.get("/env", (req, res) => {
  res.json({ MONGODB_URI: process.env.MONGODB_URI });
});
export default router;
