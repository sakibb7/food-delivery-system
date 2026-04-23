import { RequestHandler } from "express";
import catchErrors from "../utils/catchErrors.js";
import { createRoleSchema, updateRoleSchema } from "./role.schemas.js";
import {
  createRoleService,
  deleteRoleService,
  getRolesService,
  updateRoleService,
} from "./role.services.js";
import { CREATED, OK } from "../constants/http.js";

export const createRole: RequestHandler = catchErrors(async (req, res) => {
  const data = createRoleSchema.parse(req.body);
  const role = await createRoleService(data);

  res.status(CREATED).json({
    status: "success",
    data: role,
  });
});

export const getRoles: RequestHandler = catchErrors(async (req, res) => {
  const roles = await getRolesService();

  res.status(OK).json({
    status: "success",
    data: roles,
  });
});

export const updateRole: RequestHandler = catchErrors(async (req, res) => {
  const id = parseInt(req.params.id);
  const data = updateRoleSchema.parse(req.body);
  const role = await updateRoleService(id, data);

  res.status(OK).json({
    status: "success",
    data: role,
  });
});

export const deleteRole: RequestHandler = catchErrors(async (req, res) => {
  const id = parseInt(req.params.id);
  await deleteRoleService(id);

  res.status(OK).json({
    status: "success",
    message: "Role deleted successfully",
  });
});
