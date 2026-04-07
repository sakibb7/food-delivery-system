import { RequestHandler } from "express";
import { JwtPayload } from "jsonwebtoken";
import appAssert from "../utils/appAssert.js";
import { UNAUTHORIZED } from "../constants/http.js";
import AppErrorCode from "../constants/appErrorCode.js";
import { verifyToken } from "../utils/jwt.js";

interface CustomJwtPayload extends JwtPayload {
  userId: number;
  sessionId: string;
}

const authenticate: RequestHandler = (req, res, next) => {
  const accessToken = req.cookies.accessToken as string | undefined;

  appAssert(
    accessToken,
    UNAUTHORIZED,
    "Not Authorized",
    AppErrorCode.InvalidAccessToken,
  );

  const { error, payload } = verifyToken(accessToken);

  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token",
    AppErrorCode.InvalidAccessToken,
  );

  const decoded = payload as CustomJwtPayload;

  const request = req as typeof req & {
    userId: number;
    sessionId: string;
  };

  request.userId = decoded.userId;
  request.sessionId = decoded.sessionId;

  next();
};

export default authenticate;
