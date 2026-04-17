import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  verifyOtp,
} from "../controllers/Auth/usercontroller.js";
import {
  authorizeRoles,
  isAuthenticated,
} from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", isAuthenticated, getCurrentUser);
router.post("/verify-otp", verifyOtp);
router.get("/admin-only", isAuthenticated, authorizeRoles("admin"), (_req, res) =>
  res.json({ success: true, message: "Admin access granted." })
);

export default router;
