import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { restaurantsTable } from "../db/schema/restaurantSchema.js";

const generateSlug = (name: string) => {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") +
    "-" +
    Math.random().toString(36).substring(2, 6)
  );
};

export const createRestaurant = async (
  ownerId: number,
  data: Omit<
    typeof restaurantsTable.$inferInsert,
    "id" | "ownerId" | "slug" | "createdAt" | "updatedAt"
  >
) => {
  const slug = generateSlug(data.name);

  const [restaurant] = await db
    .insert(restaurantsTable)
    .values({
      ...data,
      slug,
      ownerId,
    })
    .returning();

  return restaurant;
};

export const updateRestaurant = async (
  id: number,
  ownerId: number,
  data: Partial<typeof restaurantsTable.$inferInsert>
) => {
  if (data.name && !data.slug) {
    // Optionally update slug if name changes, or keep original. We will keep original unless specifically requested.
  }

  const [updatedRestaurant] = await db
    .update(restaurantsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(restaurantsTable.id, id), eq(restaurantsTable.ownerId, ownerId)))
    .returning();

  return updatedRestaurant;
};

export const deleteRestaurant = async (id: number, ownerId: number) => {
  const [deletedRestaurant] = await db
    .delete(restaurantsTable)
    .where(and(eq(restaurantsTable.id, id), eq(restaurantsTable.ownerId, ownerId)))
    .returning();

  return deletedRestaurant;
};

export const getRestaurantById = async (id: number) => {
  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, id))
    .limit(1);

  return restaurant;
};

export const getAllRestaurants = async () => {
  // We can add filtering/pagination here later
  const restaurants = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.isActive, true));

  return restaurants;
};

export const getMyRestaurants = async (ownerId: number) => {
  const restaurants = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.ownerId, ownerId));

  return restaurants;
};
