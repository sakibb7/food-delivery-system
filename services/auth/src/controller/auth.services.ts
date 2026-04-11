import { and, eq, gt, InferSelectModel } from "drizzle-orm";
import {
  BAD_REQUEST,
  CONFLICT,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from "../constants/http.js";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema/userSchema.js";
import appAssert from "../utils/appAssert.js";
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
import { APP_ORIGIN } from "../constants/env.js";

export type CreateAccountParams = z.infer<typeof registerSchema> & {
  userAgent?: string | undefined;
};

type User = InferSelectModel<typeof usersTable>;

export function omitPassword(user: User) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export const createAccount = async (data: CreateAccountParams) => {
  return await db.transaction(async (tx) => {
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

    await transporter.sendMail({
      from: "no-reply@yourapp.com",
      to: user.email,
      subject: "Verify your email",
      html: `
    <h2>Verify your email</h2>
    <p>Click the link below:</p>
    <a href="${APP_ORIGIN}/verify-email?token=${verification?.id}">
      Verify Email
    </a>
  `,
    });

    return {
      user: omitPassword(user),
      accessToken,
      refreshToken,
    };
  });
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
  // const validCode = await VerificationCodeModel.findOne({
  //   _id: code,
  //   type: VerificationCodeType.EmailVerification,
  //   expiresAt: { $gt: new Date() },
  // });

  const [validCode] = await db
    .select()
    .from(verificationTable)
    .where(
      and(
        eq(verificationTable.id, code),
        eq(verificationTable.type, "email_verification"),
        gt(verificationTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      emailVerifiedAt: new Date(),
    })
    .where(eq(usersTable.id, validCode.userId))
    .returning();

  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

  await db
    .delete(verificationTable)
    .where(eq(verificationTable.id, validCode.id));

  return {
    user: omitPassword(updatedUser),
  };
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
        expiresAt: new Date(),
      })
      .where(eq(sessionsTable.id, session.id));
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signToken(
        {
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
      <a href="${APP_ORIGIN}/reset-password?token=${verification?.id}">
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
  },
  userAgent?: string,
) => {
  if (!googleUser.email || !googleUser.id) {
    throw new Error("Invalid Google user profile");
  }

  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, googleUser.email))
    .limit(1);

  let user = existingUser;

  if (!user) {
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
  } else if (user.provider !== "google" || user.providerId !== googleUser.id) {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        provider: "google",
        providerId: googleUser.id,
      })
      .where(eq(usersTable.id, user.id))
      .returning();
    user = updatedUser;
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
