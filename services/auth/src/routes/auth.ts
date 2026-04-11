import express from "express";
import {
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
  verifyEmailHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  myProfileHandler,
  googleAuthHandler,
  googleAuthCallbackHandler,
} from "../controller/auth.controller.js";
import catchErrors from "../utils/catchErrors.js";
import { OK } from "../constants/http.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();
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
router.post("/password/forgot", forgotPasswordHandler);
router.post("/password/reset", resetPasswordHandler);
router.get("/me", authenticate, myProfileHandler);
router.get("/google", googleAuthHandler);
router.get("/google/callback", googleAuthCallbackHandler);

export default router;
