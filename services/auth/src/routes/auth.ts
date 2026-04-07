import express from "express";
import { registerHandler } from "../controller/auth.js";
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

export default router;
