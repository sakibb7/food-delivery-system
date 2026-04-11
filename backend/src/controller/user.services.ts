import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema/userSchema.js";
import {
  updateProfileSchema,
  updatePasswordSchema,
} from "./user.schemas.js";
import z from "zod";
import appAssert from "../utils/appAssert.js";
import {
  NOT_FOUND,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
} from "../constants/http.js";
import { compareValue, hashValue } from "../utils/bcrypt.js";
import { omitPassword } from "./auth.services.js";

type UpdateProfileParams = z.infer<typeof updateProfileSchema>;
type UpdatePasswordParams = z.infer<typeof updatePasswordSchema>;

export const updateProfile = async (
  userId: number,
  data: UpdateProfileParams
) => {
  const [updatedUser] = await db
    .update(usersTable)
    .set({
      ...data,
    })
    .where(eq(usersTable.id, userId))
    .returning();

  appAssert(updatedUser, NOT_FOUND, "User not found or update failed");

  return omitPassword(updatedUser);
};

export const changePassword = async (
  userId: number,
  data: UpdatePasswordParams
) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  appAssert(user, NOT_FOUND, "User not found");
  appAssert(user.passwordHash, UNAUTHORIZED, "User is not registered with a password");

  const isValidPassword = await compareValue(
    data.currentPassword,
    user.passwordHash
  );

  appAssert(isValidPassword, UNAUTHORIZED, "Incorrect current password");

  const newPasswordHash = await hashValue(data.newPassword);

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      passwordHash: newPasswordHash,
    })
    .where(eq(usersTable.id, userId))
    .returning();

  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to update password");

  return omitPassword(updatedUser);
};
