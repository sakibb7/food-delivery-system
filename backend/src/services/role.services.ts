import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { adminRolesTable } from "../db/schema/roleSchema.js";
import { usersTable } from "../db/schema/userSchema.js";
import AppError from "../utils/AppError.js";
import { CONFLICT, NOT_FOUND } from "../constants/http.js";
import AppErrorCode from "../constants/appErrorCode.js";

export const createRoleService = async (data: {
  name: string;
  description?: string | undefined;
  permissions: string[];
}) => {
  const [role] = await db.insert(adminRolesTable).values({
    name: data.name,
    description: data.description,
    permissions: data.permissions,
  }).returning();
  return role;
};

export const getRolesService = async () => {
  return await db.select().from(adminRolesTable);
};

export const updateRoleService = async (
  id: number,
  data: {
    name?: string | undefined;
    description?: string | undefined;
    permissions?: string[] | undefined;
  }
) => {
  const [existingRole] = await db
    .select()
    .from(adminRolesTable)
    .where(eq(adminRolesTable.id, id))
    .limit(1);

  if (!existingRole) {
    throw new AppError(NOT_FOUND, "Role not found");
  }

  if (existingRole.isSystem) {
    throw new AppError(
      CONFLICT,
      "Cannot modify a system role",
      AppErrorCode.AccessDenied
    );
  }

  const [updatedRole] = await db
    .update(adminRolesTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(adminRolesTable.id, id))
    .returning();

  return updatedRole;
};

export const deleteRoleService = async (id: number) => {
  const [existingRole] = await db
    .select()
    .from(adminRolesTable)
    .where(eq(adminRolesTable.id, id))
    .limit(1);

  if (!existingRole) {
    throw new AppError(NOT_FOUND, "Role not found");
  }

  if (existingRole.isSystem) {
    throw new AppError(
      CONFLICT,
      "Cannot delete a system role",
      AppErrorCode.AccessDenied
    );
  }

  // Check if role is assigned to any user
  const assignedUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.adminRoleId, id))
    .limit(1);

  if (assignedUsers.length > 0) {
    throw new AppError(
      CONFLICT,
      "Cannot delete role because it is currently assigned to one or more staff members",
      AppErrorCode.AccessDenied
    );
  }

  await db.delete(adminRolesTable).where(eq(adminRolesTable.id, id));
};
