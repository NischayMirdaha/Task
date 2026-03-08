import express from "express";
import multer from "multer";
import { scanMalpot, getAllScans, getScanById, deleteScan } from "../controllers/Scan/scanController.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB — fax TIFFs can be large
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/tiff",      // fax output
      "image/bmp",       // some scanner software
      "application/pdf",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Use JPG, PNG, TIFF, BMP, or PDF.`));
    }
  },
});

// POST   /api/scan          — upload + OCR + save
// GET    /api/scans         — list all (?page=1&limit=20&status=Completed)
// GET    /api/scans/:id     — get single scan
// DELETE /api/scans/:id     — delete scan

router.post("/scan",      upload.single("document"), scanMalpot);
router.get("/scans",      getAllScans);
router.get("/scans/:id",  getScanById);
router.delete("/scans/:id", deleteScan);

export default router;