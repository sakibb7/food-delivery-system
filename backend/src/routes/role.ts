import { Router } from "express";
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
} from "../controller/role.controller.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import requirePermission from "../middlewares/requirePermission.js";

const roleRoutes = Router();

// Only admin users with specific permissions can access role management
roleRoutes.use(authenticate);
roleRoutes.use(authorize(["admin"]));

roleRoutes.get("/", getRoles); // Everyone with admin role can view roles
roleRoutes.post("/", requirePermission("edit_admins"), createRole);
roleRoutes.put("/:id", requirePermission("edit_admins"), updateRole);
roleRoutes.delete("/:id", requirePermission("delete_admins"), deleteRole);

export default roleRoutes;
