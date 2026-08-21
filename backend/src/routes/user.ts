import express from "express";
import {
  getProfileHandler,
  updateProfileHandler,
  changePasswordHandler,
  adminGetAllUsersHandler,
  adminToggleBanUserHandler,
  adminGetUserDetailsHandler,
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
router.get("/admin/:id", authorize(["admin"]), adminGetUserDetailsHandler);
router.patch("/:id/ban", authorize(["admin"]), adminToggleBanUserHandler);

export default router;
