import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(100, "Subject must not exceed 100 characters"),
  type: z.enum([
    "order_issue",
    "payment_issue",
    "account_management",
    "bug_report",
    "general_inquiry",
  ]),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must not exceed 5000 characters"),
  attachmentUrl: z.string().optional(),
});

export const ticketIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid ticket ID"),
});

export const replyToTicketSchema = z.object({
  text: z
    .string()
    .min(1, "Reply cannot be empty")
    .max(5000, "Reply must not exceed 5000 characters"),
  attachmentUrl: z.string().optional(),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved"]),
});
