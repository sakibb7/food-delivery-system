import express from "express";
import {
  getAddressesHandler,
  getAddressByIdHandler,
  createAddressHandler,
  updateAddressHandler,
  deleteAddressHandler,
} from "../controller/address.controller.js";

const router = express.Router();

router.get("/", getAddressesHandler);
router.get("/:id", getAddressByIdHandler);
router.post("/", createAddressHandler);
router.put("/:id", updateAddressHandler);
router.delete("/:id", deleteAddressHandler);

export default router;
