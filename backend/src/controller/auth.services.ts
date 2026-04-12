import { and, eq, gt, InferSelectModel } from "drizzle-orm";
import {
  BAD_REQUEST,
  CONFLICT,
  FORBIDDEN,
  GONE,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from "../constants/http.js";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema/userSchema.js";
import appAssert from "../utils/appAssert.js";
import AppErrorCode from "../constants/appErrorCode.js";
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signToken,
  verifyToken,
} from "../utils/jwt.js";
import { sessionsTable } from "../db/schema/sessionSchema.js";
import {
  ONE_DAY_MS,
  oneHourFromNow,
  thirtyDaysFromNow,
} from "../utils/date.js";
import { compareValue, hashValue } from "../utils/bcrypt.js";
import { registerSchema } from "./auth.schemas.js";
import z from "zod";
import { transporter } from "../utils/mailer.js";
import {
  VerificationCodeType,
  verificationTable,
} from "../db/schema/verificationSchema.js";
import { APP_ORIGIN, CLIENT_WEB_APP_URL } from "../constants/env.js";

export type CreateAccountParams = z.infer<typeof registerSchema> & {
  userAgent?: string | undefined;
};

type User = InferSelectModel<typeof usersTable>;

export function omitPassword(user: User) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export const createAccount = async (data: CreateAccountParams) => {
  const { user, accessToken, refreshToken, verificationId } =
    await db.transaction(async (tx) => {
      const existingUser = await tx
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, data.email))
        .limit(1);

      appAssert(existingUser.length === 0, CONFLICT, "Email already in use");

      appAssert(data.password, BAD_REQUEST, "Password is required");

      const hashedPassword = await hashValue(data.password);

      const [user] = await tx
        .insert(usersTable)
        .values({
          firstName: data.firstName,
          lastName: data.lastName,
          avatar: data?.avatar,
          passwordHash: hashedPassword,
          email: data.email,
          phone: data?.phone,
          address: data?.address,
          city: data?.city,
          country: data?.country,
          zipcode: data?.zipcode,
          status: "active",
          role: "user",
        })
        .returning();

      if (!user) throw new Error("User creation failed");

      const [session] = await tx
        .insert(sessionsTable)
        .values({
          userId: user.id,
          userAgent: data.userAgent ?? "unknown",
          expiresAt: thirtyDaysFromNow(),
        })
        .returning();

      if (!session) throw new Error("Session creation failed");

      const [verification] = await tx
        .insert(verificationTable)
        .values({
          userId: user.id,
          type: "email_verification",
          expiresAt: oneHourFromNow(),
        })
        .returning();

      const refreshToken = signToken(
        { userId: user.id, sessionId: session.id },
        refreshTokenSignOptions,
      );

      const accessToken = signToken({
        userId: user.id,
        sessionId: session.id,
      });

      return {
        user: omitPassword(user),
        accessToken,
        refreshToken,
        verificationId: verification?.id,
      };
    });

  // Send verification email outside the transaction (fire-and-forget)
  transporter
    .sendMail({
      from: "no-reply@yourapp.com",
      to: user.email,
      subject: "Verify your email",
      html: ` <html>
  <body style="margin:0; padding:0; background-color:#f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4; padding:20px 0;">
      <tr>
        <td align="center">
    
      <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
        
       
        <tr>
          <td align="center" style="padding:20px; background-color:#4f46e5; color:#ffffff; font-family:Arial, sans-serif; font-size:20px; font-weight:bold;">
            Verify Your Email
          </td>
        </tr>

 
        <tr>
          <td style="padding:30px; font-family:Arial, sans-serif; color:#333333; font-size:16px; line-height:1.5;">
            
            <p style="margin:0 0 15px;">
              Hi,
            </p>

            <p style="margin:0 0 20px;">
              Thanks for signing up! Please confirm your email address by clicking the button below.
            </p>

          
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:20px auto;">
              <tr>
                <td align="center" bgcolor="#4f46e5" style="border-radius:6px;">
                  <a href="${APP_ORIGIN}/verify-email?token=${verificationId}"
                     style="display:inline-block; padding:12px 24px; font-size:16px; color:#ffffff; text-decoration:none; font-family:Arial, sans-serif;">
                    Verify Email
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:20px 0 10px; font-size:14px; color:#555;">
              If the button doesn’t work, copy and paste this link into your browser:
            </p>

            <p style="word-break:break-all; font-size:14px;">
              <a href="${APP_ORIGIN}/verify-email?token=${verificationId}" style="color:#4f46e5;">
                ${APP_ORIGIN}/verify-email?token=${verificationId}
              </a>
            </p>

            <p style="margin-top:25px; font-size:14px; color:#777;">
              If you didn’t create an account, you can safely ignore this email.
            </p>

          </td>
        </tr>

      
        <tr>
          <td align="center" style="padding:15px; font-family:Arial, sans-serif; font-size:12px; color:#aaaaaa;">
            © ${new Date().getFullYear()} Your Company
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

  </body>
</html>

  `,
    })
    .catch((err: unknown) =>
      console.error("Failed to send verification email:", err),
    );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export type LoginParams = {
  email: string;
  password: string;
  userAgent?: string | undefined;
};

export const loginUser = async ({
  email,
  password,
  userAgent,
}: LoginParams) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  appAssert(user, UNAUTHORIZED, "Invalid email or password");

  appAssert(user.status === "active", FORBIDDEN, "Account is inactive");

  appAssert(user.passwordHash, UNAUTHORIZED, "Invalid email or password");

  const isValid = await compareValue(password, user.passwordHash);

  appAssert(isValid, UNAUTHORIZED, "Invalid email or password");

  const [session] = await db
    .insert(sessionsTable)
    .values({
      userId: user.id,
      userAgent: userAgent ?? "unknown",
      expiresAt: thirtyDaysFromNow(),
    })
    .returning();

  appAssert(session, INTERNAL_SERVER_ERROR, "Session creation failed");

  const payload = {
    userId: user.id,
    sessionId: session.id,
  };

  const refreshToken = signToken(payload, refreshTokenSignOptions);
  const accessToken = signToken(payload);

  return {
    user: omitPassword(user),
    accessToken,
    refreshToken,
  };
};

export const verifyEmail = async (code: string) => {
  // First, look up the code regardless of expiry to distinguish "not found" vs "expired"
  const [codeRecord] = await db
    .select()
    .from(verificationTable)
    .where(
      and(
        eq(verificationTable.id, code),
        eq(verificationTable.type, "email_verification"),
      ),
    )
    .limit(1);

  appAssert(codeRecord, NOT_FOUND, "Invalid verification code");

  // Check if the code has expired
  appAssert(
    codeRecord.expiresAt.getTime() > Date.now(),
    GONE,
    "Verification code has expired. Please request a new one.",
    AppErrorCode.VerificationCodeExpired,
  );

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      emailVerifiedAt: new Date(),
    })
    .where(eq(usersTable.id, codeRecord.userId))
    .returning();

  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

  await db
    .delete(verificationTable)
    .where(eq(verificationTable.id, codeRecord.id));

  return {
    user: omitPassword(updatedUser),
  };
};

export const resendVerificationEmail = async (userId: number) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  appAssert(user, NOT_FOUND, "User not found");

  appAssert(!user.emailVerifiedAt, BAD_REQUEST, "Email is already verified");

  // Delete any existing email verification codes for this user
  await db
    .delete(verificationTable)
    .where(
      and(
        eq(verificationTable.userId, userId),
        eq(verificationTable.type, "email_verification"),
      ),
    );

  const [verification] = await db
    .insert(verificationTable)
    .values({
      userId: user.id,
      type: "email_verification",
      expiresAt: oneHourFromNow(),
    })
    .returning();

  appAssert(
    verification,
    INTERNAL_SERVER_ERROR,
    "Failed to create verification code",
  );

  // Send new verification email
  await transporter.sendMail({
    from: "no-reply@yourapp.com",
    to: user.email,
    subject: "Verify your email",
    html: `<html>
  <body style="margin:0; padding:0; background-color:#f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4; padding:20px 0;">
      <tr>
        <td align="center">
      <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
        <tr>
          <td align="center" style="padding:20px; background-color:#4f46e5; color:#ffffff; font-family:Arial, sans-serif; font-size:20px; font-weight:bold;">
            Verify Your Email
          </td>
        </tr>
        <tr>
          <td style="padding:30px; font-family:Arial, sans-serif; color:#333333; font-size:16px; line-height:1.5;">
            <p style="margin:0 0 15px;">Hi,</p>
            <p style="margin:0 0 20px;">You requested a new verification link. Please confirm your email address by clicking the button below.</p>
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:20px auto;">
              <tr>
                <td align="center" bgcolor="#4f46e5" style="border-radius:6px;">
                  <a href="${APP_ORIGIN}/verify-email?token=${verification.id}"
                     style="display:inline-block; padding:12px 24px; font-size:16px; color:#ffffff; text-decoration:none; font-family:Arial, sans-serif;">
                    Verify Email
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:20px 0 10px; font-size:14px; color:#555;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break:break-all; font-size:14px;">
              <a href="${APP_ORIGIN}/verify-email?token=${verification.id}" style="color:#4f46e5;">
                ${APP_ORIGIN}/verify-email?token=${verification.id}
              </a>
            </p>
            <p style="margin-top:25px; font-size:14px; color:#777;">This link will expire in 1 hour. If you didn't create an account, you can safely ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:15px; font-family:Arial, sans-serif; font-size:12px; color:#aaaaaa;">
            &copy; ${new Date().getFullYear()} Your Company
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
  </body>
</html>`,
  });

  return { message: "Verification email sent" };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, payload.sessionId))
    .limit(1);

  const now = Date.now();
  appAssert(
    session && session.expiresAt.getTime() > now,
    UNAUTHORIZED,
    "Session expired",
  );

  // refresh the session if it expires in the next 24hrs
  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;

  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow();

    await db
      .update(sessionsTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionsTable.id, session.id));
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signToken(
        {
          userId: session.userId,
          sessionId: session.id,
        },
        refreshTokenSignOptions,
      )
    : undefined;

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session.id,
  });

  return {
    accessToken,
    newRefreshToken,
  };
};

export const forgotPassword = async (email: string) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user) {
    return;
  }

  // Delete any existing password reset codes for this user
  await db
    .delete(verificationTable)
    .where(
      and(
        eq(verificationTable.userId, user.id),
        eq(verificationTable.type, "password_reset"),
      ),
    );

  const [verification] = await db
    .insert(verificationTable)
    .values({
      userId: user.id,
      type: "password_reset",
      expiresAt: oneHourFromNow(),
    })
    .returning();

  await transporter.sendMail({
    from: "no-reply@yourapp.com",
    to: user.email,
    subject: "Reset your password",
    html: `
      <h2>Reset your password</h2>
      <p>Click the link below:</p>
      <a href="${CLIENT_WEB_APP_URL}/reset-password?token=${verification?.id}">
        Reset Password
      </a>
    `,
  });
};

export const resetPassword = async (password: string, code: string) => {
  const [validCode] = await db
    .select()
    .from(verificationTable)
    .where(
      and(
        eq(verificationTable.id, code),
        eq(verificationTable.type, "password_reset"),
        gt(verificationTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  appAssert(validCode, NOT_FOUND, "Invalid or expired reset token");

  const hashedPassword = await hashValue(password);

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      passwordHash: hashedPassword,
    })
    .where(eq(usersTable.id, validCode.userId))
    .returning();

  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to reset password");

  await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.userId, validCode.userId));

  await db
    .delete(verificationTable)
    .where(eq(verificationTable.id, validCode.id));
};

export const loginWithGoogle = async (
  googleUser: {
    email?: string | null;
    given_name?: string | null;
    family_name?: string | null;
    picture?: string | null;
    id?: string | null;
    verified_email?: boolean | null;
  },
  userAgent?: string,
) => {
  if (!googleUser.email || !googleUser.id) {
    throw new Error("Invalid Google user profile");
  }

  // Require Google email to be verified
  appAssert(
    googleUser.verified_email !== false,
    BAD_REQUEST,
    "Google email must be verified",
  );

  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, googleUser.email))
    .limit(1);

  let user = existingUser;

  if (!user) {
    // New user — create account via Google
    const [newUser] = await db
      .insert(usersTable)
      .values({
        email: googleUser.email,
        firstName: googleUser.given_name || "User",
        lastName: googleUser.family_name || "",
        avatar: googleUser.picture,
        provider: "google",
        providerId: googleUser.id,
        emailVerifiedAt: new Date(),
        status: "active",
        role: "user",
      })
      .returning();
    user = newUser;
  } else {
    // Existing user — only allow login if they are already a Google user
    appAssert(
      user.provider === "google",
      CONFLICT,
      "An account with this email already exists. Please login with your password.",
    );

    // Update providerId if it changed
    if (user.providerId !== googleUser.id) {
      const [updatedUser] = await db
        .update(usersTable)
        .set({
          providerId: googleUser.id,
        })
        .where(eq(usersTable.id, user.id))
        .returning();
      user = updatedUser;
    }
  }

  appAssert(user, INTERNAL_SERVER_ERROR, "Failed to authenticate user");

  const [session] = await db
    .insert(sessionsTable)
    .values({
      userId: user.id,
      userAgent: userAgent ?? "unknown",
      expiresAt: thirtyDaysFromNow(),
    })
    .returning();

  appAssert(session, INTERNAL_SERVER_ERROR, "Session creation failed");

  const payload = {
    userId: user.id,
    sessionId: session.id,
  };

  const refreshToken = signToken(payload, refreshTokenSignOptions);
  const accessToken = signToken(payload);

  return {
    user: omitPassword(user),
    accessToken,
    refreshToken,
  };
};

export const getMyProfile = async (userId: number) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  appAssert(user, NOT_FOUND, "User not found");

  return omitPassword(user);
};
