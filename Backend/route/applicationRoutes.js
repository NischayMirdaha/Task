import express from "express";
import {
  submitApplication,
  updateApplicationStatus,
  getMyApplications,
  getAllApplications
} from "../controllers/Application/applicationController.js";

import { isAuthenticated, isOfficer } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Citizen
router.post(
  "/submit",
  isAuthenticated,
  upload.any(),
  submitApplication
);

router.get("/my", isAuthenticated, getMyApplications);

// Officer
router.get("/all", isAuthenticated, isOfficer, getAllApplications);

router.put(
  "/action/:id",
  isAuthenticated,
  isOfficer,
  updateApplicationStatus
);

export default router;
