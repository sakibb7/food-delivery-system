import { RequestHandler } from "express";
import catchErrors from "../utils/catchErrors.js";
import { OK, CREATED, NOT_FOUND, BAD_REQUEST } from "../constants/http.js";
import appAssert from "../utils/appAssert.js";
import {
  createRestaurantReviewSchema,
  createRiderReviewSchema,
  reviewTargetIdSchema,
} from "./review.schemas.js";
import {
  createRestaurantReview,
  createRiderReview,
  getRestaurantReviews,
  getRiderReviews,
  getOrderReviewStatus,
} from "./review.services.js";

export const createRestaurantReviewHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const data = createRestaurantReviewSchema.parse(req.body);
    const userId = req.userId as number;

    const review = await createRestaurantReview(userId, data);

    return res.status(CREATED).json({
      message: "Restaurant review submitted successfully",
      review,
    });
  },
);

export const createRiderReviewHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const data = createRiderReviewSchema.parse(req.body);
    const userId = req.userId as number;

    const review = await createRiderReview(userId, data);

    return res.status(CREATED).json({
      message: "Rider review submitted successfully",
      review,
    });
  },
);

export const getRestaurantReviewsHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = reviewTargetIdSchema.parse(req.params);
    const reviews = await getRestaurantReviews(Number(id));

    return res.status(OK).json({ reviews });
  },
);

export const getRiderReviewsHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = reviewTargetIdSchema.parse(req.params);
    const reviews = await getRiderReviews(Number(id));

    return res.status(OK).json({ reviews });
  },
);

export const getOrderReviewStatusHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = reviewTargetIdSchema.parse(req.params);
    const userId = req.userId as number;

    const status = await getOrderReviewStatus(Number(id), userId);

    return res.status(OK).json(status);
  },
);
