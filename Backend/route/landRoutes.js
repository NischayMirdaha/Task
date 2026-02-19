import express from "express";
import { upload } from "../Middleware/multer.js";
import { authenticate } from "../Middleware/authMiddleware.js";
import { registerLand } from './../controllers/Land/landController';

const router = express.Router();



router.post(
  "/register",
  authenticate,
  upload.single("ownershipDocument"),
  landroutes
);

export default router;
