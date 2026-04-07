import express from "express";
import catchErrors from "../utils/catchErrors.js";
import { OK } from "../constants/http.js";

const router = express.Router();

router.get(
  "/me",
  catchErrors(async (req, res, next) => {
    const userId = req.userId;

    console.log(userId);
    return res.status(OK).json({
      status: "healthy",
    });
  }),
);

export default router;
