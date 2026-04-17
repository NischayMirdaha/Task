import express from "express";
import { getDashboardSummary } from "../controllers/Dashboard/dashboardController.js";
import { isAuthenticated } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", isAuthenticated, getDashboardSummary);

export default router;
