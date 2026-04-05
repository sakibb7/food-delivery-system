import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import {
  addRestaurant,
  fetchMyRestarurant,
} from "../controllers/restaurant.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, isSeller, uploadFile, addRestaurant);
router.get("/my", isAuth, isSeller, fetchMyRestarurant);

export default router;
