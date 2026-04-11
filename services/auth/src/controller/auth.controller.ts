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
  forgotPassword,
  resetPassword,
  getMyProfile,
  loginWithGoogle,
} from "./auth.services.js";
import { verifyToken } from "../utils/jwt.js";
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
  const { user, accessToken, refreshToken } = await createAccount(request);

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json(user);
});

export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { accessToken, refreshToken } = await loginUser(request);

  console.log(accessToken, "access token", refreshToken, "refresh token");

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: "Login Successfull" });
});

export const logoutHandler = catchErrors(async (req, res) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  const { payload } = verifyToken(accessToken || "");

  if (payload) {
    // remove session from db
    await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.id, payload.sessionId));
  }

  // clear cookies
  return clearAuthCookies(res)
    .status(OK)
    .json({ message: "Logout successful" });
});

export const verifyEmailHandler = catchErrors(async (req, res) => {
  const verificationCode = verificationCodeSchema.parse(req.params.code);

  await verifyEmail(verificationCode);

  return res.status(OK).json({ message: "Email was successfully verified" });
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

export const myProfileHandler = catchErrors(async (req, res) => {
  const customReq = req as typeof req & { userId: number };
  const user = await getMyProfile(customReq.userId);
  return res.status(OK).json(user);
});

export const googleAuthHandler = catchErrors(async (req, res) => {
  const url = getGoogleAuthUrl();
  return res.redirect(url);
});

export const googleAuthCallbackHandler = catchErrors(async (req, res) => {
  const code = req.query.code as string;
  appAssert(code, BAD_REQUEST, "Authorization code not provided");

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
