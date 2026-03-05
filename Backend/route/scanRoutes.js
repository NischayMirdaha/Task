import express from "express";
import multer from "multer";
import { scanMalpot } from "../controllers/Scan/scanController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/scan", upload.single("document"), scanMalpot);

export default router;