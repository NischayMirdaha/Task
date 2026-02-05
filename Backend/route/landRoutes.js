import express from "express";
import { registerLand } from "../controllers/Land/landController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();


router.post(
  "/register",
  isAuthenticated,
  upload.single("ownershipDocument"),
  registerLand
);

export default router;
