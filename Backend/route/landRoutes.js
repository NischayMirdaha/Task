import express from "express";
import { upload } from "../Middleware/multer.js";
import { authenticate } from "../Middleware/authMiddleware.js";

const router = express.Router();



router.post(
  "/register",
  authenticate,
  upload.single("ownershipDocument"),
  registerLand
);

export default router;
