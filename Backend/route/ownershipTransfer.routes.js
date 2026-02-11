import express from "express";
import {
  createTransfer,
  getAllTransfers,
  approveTransfer,
  rejectTransfer
} from "../controllers/Ownership/ownershipTransferController.js";

import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();


// Submit transfer request
router.post("/", isAuthenticated, createTransfer);

// Get all transfers
router.get("/", isAuthenticated, getAllTransfers);

// Approve transfer
router.put("/approve/:id", isAuthenticated, approveTransfer);

// Reject transfer
router.put("/reject/:id", isAuthenticated, rejectTransfer);

export default router;
