import { RequestHandler } from "express";
import catchErrors from "../utils/catchErrors.js";
import { createStaffSchema, updateStaffSchema } from "./staff.schemas.js";
import {
  createStaffService,
  deleteStaffService,
  getStaffListService,
  updateStaffService,
} from "./staff.services.js";
import { CREATED, OK } from "../constants/http.js";

export const getStaffList: RequestHandler = catchErrors(async (req, res) => {
  const staff = await getStaffListService();

  res.status(OK).json({
    status: "success",
    data: staff,
  });
});

export const createStaff: RequestHandler = catchErrors(async (req, res) => {
  const data = createStaffSchema.parse(req.body);
  const staff = await createStaffService(data);

  res.status(CREATED).json({
    status: "success",
    data: staff,
  });
});

export const updateStaff: RequestHandler = catchErrors(async (req, res) => {
  const id = parseInt(req.params.id as string);
  const data = updateStaffSchema.parse(req.body);
  const staff = await updateStaffService(id, data);

  res.status(OK).json({
    status: "success",
    data: staff,
  });
});

export const deleteStaff: RequestHandler = catchErrors(async (req, res) => {
  const id = parseInt(req.params.id as string);
  await deleteStaffService(id);

  res.status(OK).json({
    status: "success",
    message: "Staff member deactivated successfully",
  });
});
