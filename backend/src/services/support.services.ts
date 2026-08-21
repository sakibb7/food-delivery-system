import { db } from "../db/index.js";
import {
  supportTicketsTable,
  supportMessagesTable,
} from "../db/schema/supportTicketSchema.js";
import { usersTable } from "../db/schema/userSchema.js";
import { eq, desc, and, sql, ilike, SQL } from "drizzle-orm";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate the next ticket number in the format TKT-001, TKT-002, etc.
 */
async function generateTicketNumber(): Promise<string> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(supportTicketsTable);

  const next = (result?.count ?? 0) + 1;
  return `TKT-${String(next).padStart(3, "0")}`;
}

// Map frontend type labels to DB enum values
const TYPE_LABEL_MAP: Record<string, string> = {
  "Order Issue": "order_issue",
  "Payment Issue": "payment_issue",
  "Account Management": "account_management",
  "Bug Report": "bug_report",
  "General Inquiry": "general_inquiry",
};

function normalizeType(type: string): string {
  return TYPE_LABEL_MAP[type] ?? type;
}

// ── Create ───────────────────────────────────────────────────────────────────

export async function createTicket(
  userId: number,
  data: { subject: string; type: string; message: string; attachmentUrl?: string }
) {
  const ticketNumber = await generateTicketNumber();

  const normalizedType = normalizeType(data.type) as any;

  const [ticket] = await db
    .insert(supportTicketsTable)
    .values({
      ticketNumber,
      userId,
      subject: data.subject,
      type: normalizedType,
    })
    .returning();

  // Insert the initial message
  await db.insert(supportMessagesTable).values({
    ticketId: ticket!.id,
    senderType: "user",
    senderId: userId,
    text: data.message,
    attachmentUrl: data.attachmentUrl,
  });

  return ticket!;
}

// ── Read (User) ──────────────────────────────────────────────────────────────

export async function getTicketsByUserId(userId: number) {
  const tickets = await db
    .select({
      id: supportTicketsTable.id,
      ticketNumber: supportTicketsTable.ticketNumber,
      subject: supportTicketsTable.subject,
      type: supportTicketsTable.type,
      status: supportTicketsTable.status,
      createdAt: supportTicketsTable.createdAt,
      updatedAt: supportTicketsTable.updatedAt,
    })
    .from(supportTicketsTable)
    .where(eq(supportTicketsTable.userId, userId))
    .orderBy(desc(supportTicketsTable.createdAt));

  return tickets;
}

// ── Read (Admin) ─────────────────────────────────────────────────────────────

export async function getAllTickets(filters?: {
  status?: string | undefined;
  role?: string | undefined;
  search?: string | undefined;
}) {
  const conditions: SQL[] = [];

  if (filters?.status && filters.status !== "All") {
    conditions.push(
      eq(supportTicketsTable.status, filters.status.toLowerCase() as any)
    );
  }

  if (filters?.role && filters.role !== "All") {
    conditions.push(eq(usersTable.role, filters.role.toLowerCase() as any));
  }

  if (filters?.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      sql`(${ilike(supportTicketsTable.subject, term)} OR ${ilike(supportTicketsTable.ticketNumber, term)} OR ${ilike(usersTable.firstName, term)} OR ${ilike(usersTable.lastName, term)})`
    );
  }

  const tickets = await db
    .select({
      id: supportTicketsTable.id,
      ticketNumber: supportTicketsTable.ticketNumber,
      subject: supportTicketsTable.subject,
      type: supportTicketsTable.type,
      status: supportTicketsTable.status,
      createdAt: supportTicketsTable.createdAt,
      updatedAt: supportTicketsTable.updatedAt,
      sender: sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`,
      senderEmail: usersTable.email,
      senderRole: usersTable.role,
    })
    .from(supportTicketsTable)
    .innerJoin(usersTable, eq(supportTicketsTable.userId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(supportTicketsTable.createdAt));

  return tickets;
}

// ── Read (Single ticket) ─────────────────────────────────────────────────────

export async function getTicketById(ticketId: number) {
  const [ticket] = await db
    .select({
      id: supportTicketsTable.id,
      ticketNumber: supportTicketsTable.ticketNumber,
      subject: supportTicketsTable.subject,
      type: supportTicketsTable.type,
      status: supportTicketsTable.status,
      createdAt: supportTicketsTable.createdAt,
      updatedAt: supportTicketsTable.updatedAt,
      userId: supportTicketsTable.userId,
      sender: sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`,
      senderEmail: usersTable.email,
      senderRole: usersTable.role,
    })
    .from(supportTicketsTable)
    .innerJoin(usersTable, eq(supportTicketsTable.userId, usersTable.id))
    .where(eq(supportTicketsTable.id, ticketId))
    .limit(1);

  return ticket ?? null;
}

// ── Messages ─────────────────────────────────────────────────────────────────

export async function getTicketMessages(ticketId: number) {
  const messages = await db
    .select({
      id: supportMessagesTable.id,
      senderType: supportMessagesTable.senderType,
      senderId: supportMessagesTable.senderId,
      text: supportMessagesTable.text,
      attachmentUrl: supportMessagesTable.attachmentUrl,
      createdAt: supportMessagesTable.createdAt,
      senderName: sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`,
    })
    .from(supportMessagesTable)
    .innerJoin(usersTable, eq(supportMessagesTable.senderId, usersTable.id))
    .where(eq(supportMessagesTable.ticketId, ticketId))
    .orderBy(supportMessagesTable.createdAt);

  return messages;
}

export async function addMessage(
  ticketId: number,
  senderId: number,
  senderType: "user" | "staff",
  text: string,
  attachmentUrl?: string
) {
  const [message] = await db
    .insert(supportMessagesTable)
    .values({
      ticketId,
      senderType,
      senderId,
      text,
      attachmentUrl,
    })
    .returning();

  // If staff replies and ticket is still "open", move to "in_progress"
  if (senderType === "staff") {
    await db
      .update(supportTicketsTable)
      .set({ status: "in_progress", updatedAt: new Date() })
      .where(
        and(
          eq(supportTicketsTable.id, ticketId),
          eq(supportTicketsTable.status, "open")
        )
      );
  }

  return message;
}

// ── Status ───────────────────────────────────────────────────────────────────

export async function updateTicketStatus(
  ticketId: number,
  status: "open" | "in_progress" | "resolved"
) {
  const [updated] = await db
    .update(supportTicketsTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(supportTicketsTable.id, ticketId))
    .returning();

  return updated;
}
