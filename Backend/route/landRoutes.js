import express from "express";
import { registerLand } from "../controllers/Land/landController.js";
import isAuthenticated from "../Middleware/authMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { upload } from "../Middleware/multer.js";

const router = express.Router();


router.post(
  "/register",
  isAuthenticated,
  upload.single("ownershipDocument"),
  registerLand
);

export default router;
