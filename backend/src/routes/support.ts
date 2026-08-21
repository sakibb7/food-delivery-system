import express from "express";
import {
  createTicketHandler,
  getMyTicketsHandler,
  getAllTicketsHandler,
  getTicketDetailHandler,
  replyToTicketHandler,
  updateTicketStatusHandler,
  userReplyToTicketHandler,
} from "../controller/support.controller.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// All routes require authentication (applied in index.ts)

// User routes
router.post("/", createTicketHandler);
router.get("/", getMyTicketsHandler);
router.post("/:id/user-reply", userReplyToTicketHandler);

// Admin routes
router.get("/admin/all", authorize(["admin"]), getAllTicketsHandler);
router.post("/:id/reply", authorize(["admin"]), replyToTicketHandler);
router.patch("/:id/status", authorize(["admin"]), updateTicketStatusHandler);

// Shared — authenticated users can view their own ticket detail
router.get("/:id", getTicketDetailHandler);

export default router;
