import express from "express";
import {
  getProfileHandler,
  updateProfileHandler,
  changePasswordHandler,
  adminGetAllUsersHandler,
  adminToggleBanUserHandler,
} from "../controller/user.controller.js";
import { getAddressesHandler } from "../controller/address.controller.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// Regular user routes (already behind authenticate in index.ts)
router.get("/me", getProfileHandler);
router.put("/profile", updateProfileHandler);
router.put("/password", changePasswordHandler);

// Admin-only routes
router.get("/admin/all", authorize(["admin"]), adminGetAllUsersHandler);
router.patch("/:id/ban", authorize(["admin"]), adminToggleBanUserHandler);

export default router;
