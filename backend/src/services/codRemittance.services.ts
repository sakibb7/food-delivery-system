import { db } from "../db/index.js";
import { codRemittancesTable } from "../db/schema/codRemittanceSchema.js";
import { ordersTable } from "../db/schema/orderSchema.js";
import { usersTable } from "../db/schema/userSchema.js";
import { restaurantsTable } from "../db/schema/restaurantSchema.js";
import { eq, and, desc, sum, inArray } from "drizzle-orm";

/**
 * Auto-create a COD remittance record when a COD order is delivered.
 * Called from rider.services.ts → deliverOrder()
 */
export const createCodRemittance = async (
  riderId: number,
  orderId: number,
  amountCollected: number,
  riderEarnings: number
) => {
  const amountToRemit = Math.round((amountCollected - riderEarnings) * 100) / 100;

  const [remittance] = await db
    .insert(codRemittancesTable)
    .values({
      riderId,
      orderId,
      amountCollected: amountCollected.toFixed(2),
      amountToRemit: amountToRemit.toFixed(2),
      status: "pending",
    })
    .returning();

  return remittance;
};

/**
 * Get total unremitted COD cash for a rider
 */
export const getRiderCodBalance = async (riderId: number): Promise<number> => {
  const [result] = await db
    .select({ total: sum(codRemittancesTable.amountToRemit) })
    .from(codRemittancesTable)
    .where(
      and(
        eq(codRemittancesTable.riderId, riderId),
        eq(codRemittancesTable.status, "pending")
      )
    );

  return Number(result?.total || 0);
};

/**
 * Get all COD remittance records for a rider
 */
export const getRiderCodRemittances = async (riderId: number) => {
  return await db
    .select({
      id: codRemittancesTable.id,
      orderId: codRemittancesTable.orderId,
      amountCollected: codRemittancesTable.amountCollected,
      amountToRemit: codRemittancesTable.amountToRemit,
      status: codRemittancesTable.status,
      remittedAt: codRemittancesTable.remittedAt,
      confirmedAt: codRemittancesTable.confirmedAt,
      createdAt: codRemittancesTable.createdAt,
    })
    .from(codRemittancesTable)
    .where(eq(codRemittancesTable.riderId, riderId))
    .orderBy(desc(codRemittancesTable.createdAt));
};

// ── Admin services ────────────────────────────────────────────────────────────

/**
 * Get all pending COD remittances (admin view)
 */
export const getAllPendingCodRemittances = async (riderId?: number) => {
  const query = db
    .select({
      id: codRemittancesTable.id,
      riderId: codRemittancesTable.riderId,
      orderId: codRemittancesTable.orderId,
      amountCollected: codRemittancesTable.amountCollected,
      amountToRemit: codRemittancesTable.amountToRemit,
      status: codRemittancesTable.status,
      createdAt: codRemittancesTable.createdAt,
      riderFirstName: usersTable.firstName,
      riderLastName: usersTable.lastName,
      riderPhone: usersTable.phone,
    })
    .from(codRemittancesTable)
    .leftJoin(usersTable, eq(codRemittancesTable.riderId, usersTable.id));

  if (riderId) {
    return await query
      .where(eq(codRemittancesTable.riderId, riderId))
      .orderBy(desc(codRemittancesTable.createdAt));
  }

  return await query.orderBy(desc(codRemittancesTable.createdAt));
};

/**
 * Admin confirms that rider has remitted COD cash
 */
export const confirmCodRemittance = async (
  remittanceId: number,
  adminNotes?: string
) => {
  const [updated] = await db
    .update(codRemittancesTable)
    .set({
      status: "confirmed",
      confirmedAt: new Date(),
      adminNotes: adminNotes || null,
    })
    .where(eq(codRemittancesTable.id, remittanceId))
    .returning();

  return updated;
};

/**
 * Get summary stats for admin dashboard
 */
export const getCodRemittanceSummary = async () => {
  // Total pending COD across all riders
  const [pendingResult] = await db
    .select({ total: sum(codRemittancesTable.amountToRemit) })
    .from(codRemittancesTable)
    .where(eq(codRemittancesTable.status, "pending"));

  // Total confirmed
  const [confirmedResult] = await db
    .select({ total: sum(codRemittancesTable.amountToRemit) })
    .from(codRemittancesTable)
    .where(eq(codRemittancesTable.status, "confirmed"));

  return {
    totalPending: Number(pendingResult?.total || 0),
    totalConfirmed: Number(confirmedResult?.total || 0),
  };
};
