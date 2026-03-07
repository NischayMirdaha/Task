import express from "express";
import multer from "multer";
import { scanMalpot, getAllScans, getScanById } from "../controllers/Scan/scanController.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP, and PDF files are allowed."));
    }
  },
});

router.post("/scan",     upload.single("document"), scanMalpot);
router.get("/scans",     getAllScans);
router.get("/scans/:id", getScanById);

export default router;