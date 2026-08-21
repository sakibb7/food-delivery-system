import { ErrorRequestHandler, Response } from "express";
import AppError from "../utils/AppError.js";
import { clearAuthCookies, REFRESH_PATH } from "../utils/cookies.js";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http.js";
import { z } from "zod";

const handleZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => {
    const field = err.path.join(".");
    return {
      field,
      message: err.message,
    };
  });

  const message = errors
    .map((e) => `${e.field}: ${e.message}`)
    .join(", ");

  return res.status(BAD_REQUEST).json({
    message,
    errors,
  });
};

const handleAppError = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }

  if (error instanceof z.ZodError) {
    return handleZodError(res, error);
  }

  if (error instanceof AppError) {
    return handleAppError(res, error);
  }

  return res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
};

export default errorHandler;
