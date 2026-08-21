import { Router } from "express";
import * as zoneController from "../controller/zone.controller.js";
import authenticate from "../middlewares/authenticate.js";

const zoneRoute = Router();

zoneRoute.get("/", zoneController.getAllZonesHandler);
zoneRoute.post("/", authenticate, zoneController.createZoneHandler);
zoneRoute.put("/:id", authenticate, zoneController.updateZoneHandler);
zoneRoute.delete("/:id", authenticate, zoneController.deleteZoneHandler);

export default zoneRoute;
