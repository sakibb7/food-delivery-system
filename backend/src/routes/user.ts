import express from "express";
import {
  getProfileHandler,
  updateProfileHandler,
  changePasswordHandler,
} from "../controller/user.controller.js";

const router = express.Router();

router.get("/me", getProfileHandler);
router.put("/profile", updateProfileHandler);
router.put("/password", changePasswordHandler);

export default router;
