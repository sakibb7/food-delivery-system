import { eq, InferModel, InferSelectModel } from "drizzle-orm";
import { CONFLICT } from "../constants/http.js";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema/userSchema.js";
import appAssert from "../utils/appAssert.js";
import { refreshTokenSignOptions, signToken } from "../utils/jwt.js";
import { sessionsTable } from "../db/schema/sessionSchema.js";
import { thirtyDaysFromNow } from "../utils/date.js";

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

  // create user
  const [user] = await db
    .insert(usersTable)
    .values({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
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
