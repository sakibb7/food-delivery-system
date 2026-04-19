import crypto from "crypto";
import {
  CREATED,
  OK,
  UNAUTHORIZED,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from "../constants/http.js";
import catchErrors from "../utils/catchErrors.js";
import {
  loginSchema,
  registerSchema,
  verificationCodeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schemas.js";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookies.js";
import {
  createAccount,
  loginUser,
  refreshUserAccessToken,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  loginWithGoogle,
} from "./auth.services.js";
import {
  verifyToken,
  RefreshTokenPayload,
  refreshTokenSignOptions,
} from "../utils/jwt.js";
import { db } from "../db/index.js";
import { sessionsTable } from "../db/schema/sessionSchema.js";
import { eq } from "drizzle-orm";
import appAssert from "../utils/appAssert.js";
import {
  getGoogleAuthUrl,
  getGoogleOAuthTokens,
  getGoogleUser,
} from "../utils/googleAuth.js";
import { APP_ORIGIN, CLIENT_WEB_APP_URL } from "../constants/env.js";

export const registerHandler = catchErrors(async (req, res) => {
  //validate request
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  //call service
  const { user, accessToken, refreshToken } = await createAccount({ ...request, role: "user" });

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json(user);
});

export const registerRestaurantHandler = catchErrors(async (req, res) => {
  //validate request
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  //call service
  const { user, accessToken, refreshToken } = await createAccount({ ...request, role: "restaurant" });

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json(user);
});

export const registerRiderHandler = catchErrors(async (req, res) => {
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { user, accessToken, refreshToken } = await createAccount({ ...request, role: "rider" });

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json({ data: { user, accessToken, refreshToken } });
});

export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { user, accessToken, refreshToken } = await loginUser(request);

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: "Login Successfull", data: { user, accessToken, refreshToken } });
});

export const logoutHandler = catchErrors(async (req, res) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  const refreshToken = req.cookies.refreshToken as string | undefined;

  // Try access token first to find the session
  const { payload: accessPayload } = verifyToken(accessToken || "");

  if (accessPayload) {
    await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.id, accessPayload.sessionId));
  } else if (refreshToken) {
    // Fall back to refresh token if access token is expired/invalid
    const { payload: refreshPayload } = verifyToken<RefreshTokenPayload>(
      refreshToken,
      { secret: refreshTokenSignOptions.secret },
    );

    if (refreshPayload) {
      await db
        .delete(sessionsTable)
        .where(eq(sessionsTable.id, refreshPayload.sessionId));
    }
  }

  return clearAuthCookies(res)
    .status(OK)
    .json({ message: "Logout successful" });
});

export const verifyEmailHandler = catchErrors(async (req, res) => {
  const verificationCode = verificationCodeSchema.parse(req.params.code);

  await verifyEmail(verificationCode);

  return res.status(OK).json({ message: "Email was successfully verified" });
});

export const resendVerificationHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "Authentication required");

  const result = await resendVerificationEmail(userId);

  return res.status(OK).json(result);
});

export const refreshHandler = catchErrors(async (req, res) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;

  appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

  const { accessToken, newRefreshToken } =
    await refreshUserAccessToken(refreshToken);
  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
  }
  return res
    .status(OK)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .json({ message: "Access token refreshed" });
});

export const forgotPasswordHandler = catchErrors(async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  await forgotPassword(email);
  return res
    .status(OK)
    .json({ message: "If that email exists, we sent a password reset link." });
});

export const resetPasswordHandler = catchErrors(async (req, res) => {
  const { password, verificationCode } = resetPasswordSchema.parse(req.body);
  await resetPassword(password, verificationCode);
  return clearAuthCookies(res)
    .status(OK)
    .json({ message: "Password reset successful, please login again" });
});

export const googleAuthHandler = catchErrors(async (req, res) => {
  const state = crypto.randomUUID();
  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000, // 10 minutes
    path: "/api/v1/auth/google/callback",
  });
  const url = getGoogleAuthUrl(state);
  return res.redirect(url);
});

export const googleAuthCallbackHandler = catchErrors(async (req, res) => {
  const code = req.query.code as string;
  appAssert(code, BAD_REQUEST, "Authorization code not provided");

  // Verify CSRF state parameter
  const state = req.query.state as string;
  const storedState = req.cookies.oauth_state as string;
  appAssert(
    state && storedState && state === storedState,
    BAD_REQUEST,
    "Invalid OAuth state parameter",
  );
  res.clearCookie("oauth_state", { path: "/api/v1/auth/google/callback" });

  const tokens = await getGoogleOAuthTokens(code);
  const id_token = tokens.id_token as string;
  const access_token = tokens.access_token as string;

  appAssert(
    id_token && access_token,
    INTERNAL_SERVER_ERROR,
    "Failed to retrieve Google tokens",
  );

  const googleUser = await getGoogleUser(id_token, access_token);
  appAssert(
    googleUser && googleUser.email,
    INTERNAL_SERVER_ERROR,
    "Failed to retrieve Google user",
  );

  const { accessToken, refreshToken } = await loginWithGoogle(
    googleUser,
    req.headers["user-agent"] as string | undefined,
  );

  setAuthCookies({ res, accessToken, refreshToken });

  return res.redirect(`${CLIENT_WEB_APP_URL}/dashboard`);
});
