import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema/userSchema.js";
import { adminRolesTable } from "../db/schema/roleSchema.js";
import AppError from "../utils/AppError.js";
import { CONFLICT, NOT_FOUND } from "../constants/http.js";
import bcrypt from "bcryptjs";

export const getStaffListService = async () => {
  const staff = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      status: usersTable.status,
      role: adminRolesTable.name,
      lastActive: usersTable.updatedAt,
      adminRoleId: usersTable.adminRoleId,
    })
    .from(usersTable)
    .leftJoin(adminRolesTable, eq(usersTable.adminRoleId, adminRolesTable.id))
    .where(eq(usersTable.role, "admin"));
    
  return staff;
};

export const createStaffService = async (data: any) => {
  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, data.email))
    .limit(1);

  if (existingUser) {
    throw new AppError(CONFLICT, "Email is already in use");
  }

  const [role] = await db
    .select()
    .from(adminRolesTable)
    .where(eq(adminRolesTable.id, data.adminRoleId))
    .limit(1);

  if (!role) {
    throw new AppError(NOT_FOUND, "Selected role not found");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const [newStaff] = await db.insert(usersTable).values({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    passwordHash,
    role: "admin",
    adminRoleId: data.adminRoleId,
    status: "active",
  }).returning();

  return {
    id: newStaff.id,
    firstName: newStaff.firstName,
    lastName: newStaff.lastName,
    email: newStaff.email,
    status: newStaff.status,
  };
};

export const updateStaffService = async (id: number, data: any) => {
  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.id, id), eq(usersTable.role, "admin")))
    .limit(1);

  if (!existingUser) {
    throw new AppError(NOT_FOUND, "Staff member not found");
  }

  if (data.email && data.email !== existingUser.email) {
    const [emailTaken] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email))
      .limit(1);
    if (emailTaken) {
      throw new AppError(CONFLICT, "Email is already in use");
    }
  }

  if (data.adminRoleId) {
    const [role] = await db
      .select()
      .from(adminRolesTable)
      .where(eq(adminRolesTable.id, data.adminRoleId))
      .limit(1);
    if (!role) {
      throw new AppError(NOT_FOUND, "Selected role not found");
    }
  }

  const [updatedStaff] = await db
    .update(usersTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, id))
    .returning();

  return {
    id: updatedStaff.id,
    firstName: updatedStaff.firstName,
    lastName: updatedStaff.lastName,
    email: updatedStaff.email,
    status: updatedStaff.status,
  };
};

export const deleteStaffService = async (id: number) => {
  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.id, id), eq(usersTable.role, "admin")))
    .limit(1);

  if (!existingUser) {
    throw new AppError(NOT_FOUND, "Staff member not found");
  }

  // Soft delete / change status
  await db
    .update(usersTable)
    .set({
      status: "inactive", // Alternatively could delete entirely, but better to deactivate
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, id));
};
