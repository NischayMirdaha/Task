import express from "express";
import {
  createTransferRequest,
  getTransferRequests,
  reviewTransferRequest,
} from "../controllers/Ownership/transferRequestController.js";
import {
  authorizeRoles,
  isAuthenticated,
} from "../Middleware/authMiddleware.js";
import { uploadDocument } from "../Middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/transfer-request",
  isAuthenticated,
  uploadDocument.array("documents", 5),
  createTransferRequest
);
router.get("/transfer-request", isAuthenticated, getTransferRequests);
router.patch(
  "/transfer-request/:id",
  isAuthenticated,
  authorizeRoles("admin", "officer"),
  reviewTransferRequest
);

export default router;
