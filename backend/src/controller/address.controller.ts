import { OK, CREATED, UNAUTHORIZED } from "../constants/http.js";
import catchErrors from "../utils/catchErrors.js";
import { createAddressSchema, updateAddressSchema } from "./address.schemas.js";
import {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
} from "./address.services.js";
import appAssert from "../utils/appAssert.js";
import { z } from "zod";

const addressIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const getAddressesHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "User ID not found in request");

  const addresses = await getAddresses(userId);

  return res.status(OK).json({ addresses });
});

export const getAddressByIdHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "User ID not found in request");

  const { id: addressId } = addressIdParamSchema.parse(req.params);
  const address = await getAddressById(userId, addressId);

  return res.status(OK).json({ address });
});

export const createAddressHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "User ID not found in request");

  const data = createAddressSchema.parse(req.body);
  const address = await createAddress(userId, data);

  return res.status(CREATED).json({
    message: "Address created successfully",
    address,
  });
});

export const updateAddressHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "User ID not found in request");

  const { id: addressId } = addressIdParamSchema.parse(req.params);
  const data = updateAddressSchema.parse(req.body);
  const address = await updateAddress(userId, addressId, data);

  return res.status(OK).json({
    message: "Address updated successfully",
    address,
  });
});

export const deleteAddressHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "User ID not found in request");

  const { id: addressId } = addressIdParamSchema.parse(req.params);
  await deleteAddress(userId, addressId);

  return res.status(OK).json({
    message: "Address deleted successfully",
  });
});
