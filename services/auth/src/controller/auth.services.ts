import { eq, InferSelectModel } from "drizzle-orm";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
} from "../constants/http.js";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema/userSchema.js";
import appAssert from "../utils/appAssert.js";
import { refreshTokenSignOptions, signToken } from "../utils/jwt.js";
import { sessionsTable } from "../db/schema/sessionSchema.js";
import { thirtyDaysFromNow } from "../utils/date.js";
import { compareValue, hashValue } from "../utils/bcrypt.js";

export type CreataAccountParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userAgent?: string | undefined;
};

type User = InferSelectModel<typeof usersTable>;

function omitPassword(user: User) {
  const { password, ...rest } = user;
  return rest;
}

export const createAccount = async (data: CreataAccountParams) => {
  // verify user doesn't exist
  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, data.email));

  appAssert(existingUser.length === 0, CONFLICT, "Email already in use");

  const hashedPassword = await hashValue(data?.password);

  // create user
  const [user] = await db
    .insert(usersTable)
    .values({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
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
  const isValid = await compareValue(password, user.password);

  appAssert(isValid, UNAUTHORIZED, "Invalid email or password");

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
