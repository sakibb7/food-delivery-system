import { OK, CREATED } from "../constants/http.js";
import catchErrors from "../utils/catchErrors.js";
import * as zoneService from "../services/zone.services.js";
import appAssert from "../utils/appAssert.js";

export const createZoneHandler = catchErrors(async (req, res) => {
  const zone = await zoneService.createZone(req.body);
  return res.status(CREATED).json(zone);
});

export const getAllZonesHandler = catchErrors(async (_req, res) => {
  const zones = await zoneService.getAllZones();
  return res.status(OK).json(zones);
});

export const updateZoneHandler = catchErrors(async (req, res) => {
  const id = Number(req.params.id);
  appAssert(id, 400, "Zone ID is required");
  const zone = await zoneService.updateZone(id, req.body);
  return res.status(OK).json(zone);
});

export const deleteZoneHandler = catchErrors(async (req, res) => {
  const id = Number(req.params.id);
  appAssert(id, 400, "Zone ID is required");
  await zoneService.deleteZone(id);
  return res.status(OK).json({ message: "Zone deleted successfully" });
});
