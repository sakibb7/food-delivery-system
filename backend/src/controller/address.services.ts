import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { addressesTable } from "../db/schema/addressSchema.js";
import { createAddressSchema, updateAddressSchema } from "./address.schemas.js";
import z from "zod";
import appAssert from "../utils/appAssert.js";
import { NOT_FOUND, INTERNAL_SERVER_ERROR } from "../constants/http.js";

type CreateAddressParams = z.infer<typeof createAddressSchema>;
type UpdateAddressParams = z.infer<typeof updateAddressSchema>;

/**
 * If the new address is marked as default, unset all other defaults for this user.
 */
const clearDefaultAddresses = async (userId: number) => {
  await db
    .update(addressesTable)
    .set({ isDefault: false })
    .where(eq(addressesTable.userId, userId));
};

export const createAddress = async (
  userId: number,
  data: CreateAddressParams
) => {
  // If this is set as default, unset others
  if (data.isDefault) {
    await clearDefaultAddresses(userId);
  }

  const [address] = await db
    .insert(addressesTable)
    .values({
      userId,
      label: data.label,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      zipcode: data.zipcode,
      latitude: data.latitude?.toString(),
      longitude: data.longitude?.toString(),
      isDefault: data.isDefault ?? false,
    })
    .returning();

  appAssert(address, INTERNAL_SERVER_ERROR, "Failed to create address");

  return address;
};

export const getAddresses = async (userId: number) => {
  const addresses = await db
    .select()
    .from(addressesTable)
    .where(eq(addressesTable.userId, userId))
    .orderBy(addressesTable.createdAt);

  return addresses;
};

export const getAddressById = async (userId: number, addressId: number) => {
  const [address] = await db
    .select()
    .from(addressesTable)
    .where(
      and(eq(addressesTable.id, addressId), eq(addressesTable.userId, userId))
    )
    .limit(1);

  appAssert(address, NOT_FOUND, "Address not found");

  return address;
};

export const updateAddress = async (
  userId: number,
  addressId: number,
  data: UpdateAddressParams
) => {
  // Verify ownership
  await getAddressById(userId, addressId);

  // If setting this as default, unset others
  if (data.isDefault) {
    await clearDefaultAddresses(userId);
  }

  const updateData: Record<string, any> = { ...data };
  if (data.latitude !== undefined) {
    updateData.latitude = data.latitude?.toString() ?? null;
  }
  if (data.longitude !== undefined) {
    updateData.longitude = data.longitude?.toString() ?? null;
  }

  const [updatedAddress] = await db
    .update(addressesTable)
    .set(updateData)
    .where(
      and(eq(addressesTable.id, addressId), eq(addressesTable.userId, userId))
    )
    .returning();

  appAssert(updatedAddress, INTERNAL_SERVER_ERROR, "Failed to update address");

  return updatedAddress;
};

export const deleteAddress = async (userId: number, addressId: number) => {
  // Verify ownership
  await getAddressById(userId, addressId);

  const [deletedAddress] = await db
    .delete(addressesTable)
    .where(
      and(eq(addressesTable.id, addressId), eq(addressesTable.userId, userId))
    )
    .returning();

  appAssert(deletedAddress, INTERNAL_SERVER_ERROR, "Failed to delete address");

  return deletedAddress;
};
