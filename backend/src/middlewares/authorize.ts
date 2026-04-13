import { RequestHandler } from "express";
import appAssert from "../utils/appAssert.js";
import { FORBIDDEN, UNAUTHORIZED } from "../constants/http.js";
import AppErrorCode from "../constants/appErrorCode.js";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema/userSchema.js";
import { eq } from "drizzle-orm";

/**
 * Middleware to restrict access to specific roles.
 * Must be used after the `authenticate` middleware which sets `req.userId`.
 * @param allowedRoles Array of allowed roles (e.g. ["admin", "restaurant"])
 */
const authorize = (allowedRoles: string[]): RequestHandler => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      
      appAssert(userId, UNAUTHORIZED, "Authentication required", AppErrorCode.InvalidAccessToken);

      const [user] = await db
        .select({ role: usersTable.role })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      appAssert(user, UNAUTHORIZED, "User not found");
      
      appAssert(
        allowedRoles.includes(user.role ?? "user"),
        FORBIDDEN,
        "You do not have permission to perform this action",
        AppErrorCode.AccessDenied
      );

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authorize;
