import { RequestHandler } from "express";
import appAssert from "../utils/appAssert.js";
import { FORBIDDEN, UNAUTHORIZED } from "../constants/http.js";
import AppErrorCode from "../constants/appErrorCode.js";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema/userSchema.js";
import { adminRolesTable } from "../db/schema/roleSchema.js";
import { eq } from "drizzle-orm";

/**
 * Middleware to restrict access based on specific granular permissions.
 * Must be used after the `authenticate` middleware which sets `req.userId`.
 * @param requiredPermission The specific permission required (e.g. "view_orders")
 */
const requirePermission = (requiredPermission: string): RequestHandler => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      
      appAssert(userId, UNAUTHORIZED, "Authentication required", AppErrorCode.InvalidAccessToken);

      const [user] = await db
        .select({ 
          role: usersTable.role,
          adminRoleId: usersTable.adminRoleId
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      appAssert(user, UNAUTHORIZED, "User not found");
      
      // If user is a normal user/rider/restaurant, they shouldn't access dashboard endpoints.
      // But if we want, we can explicitly check if role is "admin".
      appAssert(
        user.role === "admin",
        FORBIDDEN,
        "You do not have permission to access admin features",
        AppErrorCode.AccessDenied
      );

      // Super admins could potentially bypass this, but let's assume Super Admin has all permissions in their role
      appAssert(
        user.adminRoleId,
        FORBIDDEN,
        "No admin role assigned to your account",
        AppErrorCode.AccessDenied
      );

      const [adminRole] = await db
        .select({
          permissions: adminRolesTable.permissions,
        })
        .from(adminRolesTable)
        .where(eq(adminRolesTable.id, user.adminRoleId))
        .limit(1);

      appAssert(
        adminRole,
        FORBIDDEN,
        "Assigned admin role no longer exists",
        AppErrorCode.AccessDenied
      );

      const hasPermission = adminRole.permissions && adminRole.permissions.includes(requiredPermission);

      appAssert(
        hasPermission,
        FORBIDDEN,
        `You do not have the required permission: ${requiredPermission}`,
        AppErrorCode.AccessDenied
      );

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default requirePermission;
