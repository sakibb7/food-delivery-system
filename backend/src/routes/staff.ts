import { Router } from "express";
import {
  createStaff,
  deleteStaff,
  getStaffList,
  updateStaff,
} from "../controller/staff.controller.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import requirePermission from "../middlewares/requirePermission.js";

const staffRoutes = Router();

// Only admin users with specific permissions can access staff management
staffRoutes.use(authenticate);
staffRoutes.use(authorize(["admin"]));

staffRoutes.get("/", getStaffList); // Everyone with admin role can view staff
staffRoutes.post("/", requirePermission("edit_admins"), createStaff);
staffRoutes.put("/:id", requirePermission("edit_admins"), updateStaff);
staffRoutes.delete("/:id", requirePermission("delete_admins"), deleteStaff);

export default staffRoutes;
