import { eq, and, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { menuItemsTable } from "../db/schema/menuItemSchema.js";

export const createMenuItem = async (
  restaurantId: number,
  data: Omit<
    typeof menuItemsTable.$inferInsert,
    "id" | "restaurantId" | "createdAt" | "updatedAt"
  >
) => {
  const [menuItem] = await db
    .insert(menuItemsTable)
    .values({
      ...data,
      restaurantId,
    })
    .returning();

  return menuItem;
};

export const updateMenuItem = async (
  id: number,
  restaurantId: number,
  data: Partial<typeof menuItemsTable.$inferInsert>
) => {
  const [updatedItem] = await db
    .update(menuItemsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(menuItemsTable.id, id),
        eq(menuItemsTable.restaurantId, restaurantId)
      )
    )
    .returning();

  return updatedItem;
};

export const deleteMenuItem = async (id: number, restaurantId: number) => {
  const [deletedItem] = await db
    .delete(menuItemsTable)
    .where(
      and(
        eq(menuItemsTable.id, id),
        eq(menuItemsTable.restaurantId, restaurantId)
      )
    )
    .returning();

  return deletedItem;
};

export const getMenuItemsByRestaurantId = async (restaurantId: number) => {
  const items = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.restaurantId, restaurantId))
    .orderBy(asc(menuItemsTable.category), asc(menuItemsTable.sortOrder));

  return items;
};

export const getMenuItemById = async (id: number) => {
  const [item] = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.id, id))
    .limit(1);

  return item;
};
