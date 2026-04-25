import { RequestHandler } from "express";
import catchErrors from "../utils/catchErrors.js";
import { OK, CREATED, NOT_FOUND } from "../constants/http.js";
import appAssert from "../utils/appAssert.js";
import {
  createTicketSchema,
  ticketIdSchema,
  replyToTicketSchema,
  updateTicketStatusSchema,
} from "./support.schemas.js";
import {
  createTicket,
  getTicketsByUserId,
  getAllTickets,
  getTicketById,
  getTicketMessages,
  addMessage,
  updateTicketStatus,
} from "./support.services.js";

// ── User: Create a ticket ────────────────────────────────────────────────────

export const createTicketHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const data = createTicketSchema.parse(req.body);
    const userId = req.userId as number;

    const payload = {
      subject: data.subject,
      type: data.type,
      message: data.message,
      ...(data.attachmentUrl ? { attachmentUrl: data.attachmentUrl } : {}),
    };

    const ticket = await createTicket(userId, payload);

    return res.status(CREATED).json({
      message: "Support ticket created successfully",
      ticket,
    });
  }
);

// ── User: Get my tickets ─────────────────────────────────────────────────────

export const getMyTicketsHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const userId = req.userId as number;
    const tickets = await getTicketsByUserId(userId);

    return res.status(OK).json({ tickets });
  }
);

// ── User: Reply to ticket ────────────────────────────────────────────────────

export const userReplyToTicketHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = ticketIdSchema.parse(req.params);
    const { text, attachmentUrl } = replyToTicketSchema.parse(req.body);
    const userId = req.userId as number;

    const ticket = await getTicketById(Number(id));
    appAssert(ticket, NOT_FOUND, "Ticket not found");
    
    // Ensure the ticket belongs to the user
    appAssert(ticket.userId === userId, 403, "Forbidden");

    const message = await addMessage(Number(id), userId, "user", text, attachmentUrl);

    return res.status(CREATED).json({
      message: "Reply sent successfully",
      data: message,
    });
  }
);

// ── Admin: Get all tickets ───────────────────────────────────────────────────

export const getAllTicketsHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { status, role, search } = req.query as Record<string, string | undefined>;

    const tickets = await getAllTickets({
      status: status || undefined,
      role: role || undefined,
      search: search || undefined,
    });

    return res.status(OK).json({ tickets });
  }
);

// ── Get ticket detail with messages ──────────────────────────────────────────

export const getTicketDetailHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = ticketIdSchema.parse(req.params);

    const ticket = await getTicketById(Number(id));
    appAssert(ticket, NOT_FOUND, "Ticket not found");

    const messages = await getTicketMessages(Number(id));

    return res.status(OK).json({ ticket, messages });
  }
);

// ── Admin: Reply to ticket ───────────────────────────────────────────────────

export const replyToTicketHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = ticketIdSchema.parse(req.params);
    const { text, attachmentUrl } = replyToTicketSchema.parse(req.body);
    const staffId = req.userId as number;

    const ticket = await getTicketById(Number(id));
    appAssert(ticket, NOT_FOUND, "Ticket not found");

    const message = await addMessage(Number(id), staffId, "staff", text, attachmentUrl);

    return res.status(CREATED).json({
      message: "Reply sent successfully",
      data: message,
    });
  }
);

// ── Admin: Update ticket status ──────────────────────────────────────────────

export const updateTicketStatusHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = ticketIdSchema.parse(req.params);
    const { status } = updateTicketStatusSchema.parse(req.body);

    const ticket = await getTicketById(Number(id));
    appAssert(ticket, NOT_FOUND, "Ticket not found");

    const updated = await updateTicketStatus(Number(id), status);

    return res.status(OK).json({
      message: `Ticket ${status === "resolved" ? "resolved" : "updated"} successfully`,
      ticket: updated,
    });
  }
);
