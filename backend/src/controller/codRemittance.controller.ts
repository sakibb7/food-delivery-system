import { Request, Response } from "express";
import * as codRemittanceService from "../services/codRemittance.services.js";
import catchErrors from "../utils/catchErrors.js";
import { OK } from "../constants/http.js";

// ── Rider endpoints ─────────────────────────────────────────────────────────

export const getRiderCodBalanceHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const balance = await codRemittanceService.getRiderCodBalance(userId);
    res.status(200).json({ data: { codBalance: balance } });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getRiderCodRemittancesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const remittances = await codRemittanceService.getRiderCodRemittances(userId);
    res.status(200).json({ data: remittances });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// ── Admin endpoints ─────────────────────────────────────────────────────────

export const adminGetAllCodRemittancesHandler = catchErrors(async (req, res) => {
  const riderId = req.query.riderId ? Number(req.query.riderId) : undefined;
  const remittances = await codRemittanceService.getAllPendingCodRemittances(riderId);
  const summary = await codRemittanceService.getCodRemittanceSummary();

  return res.status(OK).json({ remittances, summary });
});

export const adminConfirmCodRemittanceHandler = catchErrors(async (req, res) => {
  const id = Number(req.params.id);
  const { adminNotes } = req.body;

  const updated = await codRemittanceService.confirmCodRemittance(id, adminNotes);

  if (!updated) {
    return res.status(404).json({ message: "Remittance not found" });
  }

  return res.status(OK).json({
    message: "COD remittance confirmed successfully",
    data: updated,
  });
});
