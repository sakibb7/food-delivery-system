import { eq, InferSelectModel } from "drizzle-orm";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
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
import { ONE_DAY_MS, thirtyDaysFromNow } from "../utils/date.js";
import { compareValue, hashValue } from "../utils/bcrypt.js";
import { registerSchema } from "./auth.schemas.js";
import z from "zod";

export type CreateAccountParams = z.infer<typeof registerSchema> & {
  userAgent?: string | undefined;
};

type User = InferSelectModel<typeof usersTable>;

function omitPassword(user: User) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export const createAccount = async (data: CreateAccountParams) => {
  // verify user doesn't exist
  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, data.email));

  appAssert(existingUser.length === 0, CONFLICT, "Email already in use");

  const hashedPassword = data?.password ? await hashValue(data?.password) : "";

  // create user
  const [user] = await db
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

  const userId = user.id;

  // create session
  const [session] = await db
    .insert(sessionsTable)
    .values({
      userId,
      userAgent: data.userAgent,
      expiresAt: thirtyDaysFromNow(),
    })
    .returning();

  if (!session) throw new Error("Session creation failed");

  // tokens
  const refreshToken = signToken(
    { sessionId: session.id },
    refreshTokenSignOptions,
  );
  const accessToken = signToken({ userId, sessionId: session.id });

  return { user: omitPassword(user), accessToken, refreshToken };
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
  // get user by email
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  console.log(user, "User");

  // validate user exists
  appAssert(user, UNAUTHORIZED, "Invalid email or password");

  // validate password (assuming you stored hashed password)
  if (user.passwordHash) {
    const isValid = await compareValue(password, user.passwordHash);

    appAssert(isValid, UNAUTHORIZED, "Invalid email or password");
  }

  const userId = user.id;

  // create session
  const [session] = await db
    .insert(sessionsTable)
    .values({
      userId,
      userAgent,
      expiresAt: thirtyDaysFromNow(),
    })
    .returning();

  appAssert(session, INTERNAL_SERVER_ERROR, "Session creation failed");

  const sessionInfo = {
    sessionId: session.id,
  };

  // sign tokens
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
  const accessToken = signToken({ ...sessionInfo, userId });

  // return response
  return {
    user: omitPassword(user),
    accessToken,
    refreshToken,
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
