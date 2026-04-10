import express from "express";
import catchErrors from "../utils/catchErrors.js";
import { NOT_FOUND, OK } from "../constants/http.js";
import { usersTable } from "../db/schema/userSchema.js";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { omitPassword } from "../controller/auth.services.js";
import appAssert from "../utils/appAssert.js";

const router = express.Router();

router.get(
  "/me",
  catchErrors(async (req, res, next) => {
    const refreshToken = req.cookies;
    console.log(refreshToken, "refresh from me");
    const userId = req.userId;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    appAssert(user, NOT_FOUND, "User not found");

    console.log(userId);
    return res.status(OK).json({
      user: omitPassword(user),
    });
  }),
);

// router.get("/me", () => {
//   console.log("I ran");
// });

export default router;
