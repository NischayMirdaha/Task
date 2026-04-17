import express from "express";
import {
  createLand,
  deleteLand,
  getLandById,
  getLands,
  getLandTax,
  updateLand,
} from "../controllers/Land/landController.js";
import {
  authorizeRoles,
  isAuthenticated,
} from "../Middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/lands")
  .post(isAuthenticated, authorizeRoles("admin", "officer"), createLand)
  .get(isAuthenticated, getLands);

router.get("/lands/:id", isAuthenticated, getLandById);
router.put("/lands/:id", isAuthenticated, authorizeRoles("admin", "officer"), updateLand);
router.delete("/lands/:id", isAuthenticated, authorizeRoles("admin"), deleteLand);
router.get("/tax/:landId", isAuthenticated, getLandTax);

export default router;
