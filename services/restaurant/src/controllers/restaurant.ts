import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Restaurant from "../models/Restaurant.js";
import jwt from "jsonwebtoken";

export const addRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const existingRestaurant = await Restaurant.findOne({
      ownerId: user._id,
    });

    if (existingRestaurant) {
      return res.status(400).json({
        message: "You already have a restaurant",
      });
    }

    const { name, description, latitude, longitude, formattedAddress, phone } =
      req.body;

    if (!name || !longitude || !latitude) {
      return res.status(400).json({
        message: "Please give all details",
      });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Image is nessessary",
      });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(400).json({
        message: "Failed to create file buffer",
      });
    }

    console.log("I am here");

    const { data: uploadResult } = await axios.post(
      `${process.env.UTILS_SERVICE}/api/upload`,
      {
        buffer: fileBuffer.content,
      },
    );

    console.log(uploadResult);

    const restaurant = await Restaurant.create({
      name,
      description,
      phone,
      image: uploadResult.url,
      ownerId: user._id,
      autoLocation: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
        formattedAddress,
      },
      isVerified: false,
    });

    return res.status(201).json({
      message: "Restaurant is created",
      restaurant,
    });
  },
);

export const fetchMyRestarurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login!",
      });
    }

    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

    if (!restaurant) {
      return res.status(400).json({
        message: "No restaurant found!",
      });
    }

    if (!req.user.restaurantId) {
      const token = jwt.sign(
        {
          user: {
            ...req.user,
            restaurantId: restaurant._id,
          },
        },
        process.env.JWT_SEC as string,
        {
          expiresIn: "15d",
        },
      );

      return res.json({ restaurant, token });
    }

    res.json({ restaurant });
  },
);
