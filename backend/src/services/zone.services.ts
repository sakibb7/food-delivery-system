import { db } from "../db/index.js";
import { zonesTable } from "../db/schema/zoneSchema.js";
import { eq } from "drizzle-orm";

export const createZone = async (data: any) => {
  const [zone] = await db.insert(zonesTable).values(data).returning();
  return zone;
};

export const getAllZones = async () => {
  return await db.select().from(zonesTable).orderBy(zonesTable.createdAt);
};

export const updateZone = async (id: number, data: any) => {
  const [updatedZone] = await db
    .update(zonesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(zonesTable.id, id))
    .returning();
  return updatedZone;
};

export const deleteZone = async (id: number) => {
  const [deletedZone] = await db
    .delete(zonesTable)
    .where(eq(zonesTable.id, id))
    .returning();
  return deletedZone;
};
