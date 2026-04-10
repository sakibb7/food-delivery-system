import express from "express";
import {
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
  verifyEmailHandler,
} from "../controller/auth.controller.js";
import catchErrors from "../utils/catchErrors.js";
import { OK } from "../constants/http.js";

const router = express.Router();

// router.post("/login", loginUser);
// router.put("/add/role", isAuth, addUserRole);
// router.get("/me", isAuth, myProfile);
router.get(
  "/",
  catchErrors(async (req, res, next) => {
    return res.status(OK).json({
      status: "healthy",
    });
  }),
);
router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/logout", logoutHandler);
router.get("/refresh", refreshHandler);
router.get("/email/verify/:code", verifyEmailHandler);

export default router;
