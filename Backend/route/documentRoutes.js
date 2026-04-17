import express from "express";
import {
  getDocuments,
  updateDocumentStatus,
  uploadAndExtractDocument,
} from "../controllers/Document/documentController.js";
import {
  authorizeRoles,
  isAuthenticated,
} from "../Middleware/authMiddleware.js";
import { uploadDocument } from "../Middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/documents/ocr",
  isAuthenticated,
  uploadDocument.single("document"),
  uploadAndExtractDocument
);
router.get("/documents", isAuthenticated, getDocuments);
router.patch(
  "/documents/:id/status",
  isAuthenticated,
  authorizeRoles("admin", "officer"),
  updateDocumentStatus
);

export default router;
