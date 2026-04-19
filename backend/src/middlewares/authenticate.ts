import { RequestHandler } from "express";
import { JwtPayload } from "jsonwebtoken";
import appAssert from "../utils/appAssert.js";
import { UNAUTHORIZED } from "../constants/http.js";
import AppErrorCode from "../constants/appErrorCode.js";
import { verifyToken } from "../utils/jwt.js";
import { db } from "../db/index.js";
import { sessionsTable } from "../db/schema/sessionSchema.js";
import { eq, and, gt } from "drizzle-orm";

interface CustomJwtPayload extends JwtPayload {
  userId: number;
  sessionId: string;
}

const authenticate: RequestHandler = (req, res, next) => {
  (async () => {
    // Support both cookie-based auth (web) and Bearer token auth (mobile)
    let accessToken = req.cookies.accessToken as string | undefined;

    if (!accessToken) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        accessToken = authHeader.slice(7);
      }
    }

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

    // Validate session still exists and is not expired in DB
    const [session] = await db
      .select({ id: sessionsTable.id })
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.id, decoded.sessionId),
          gt(sessionsTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    appAssert(
      session,
      UNAUTHORIZED,
      "Session expired or revoked",
      AppErrorCode.InvalidAccessToken,
    );

    req.userId = decoded.userId;
    req.sessionId = decoded.sessionId;

    next();
  })().catch(next);
};

export default authenticate;
