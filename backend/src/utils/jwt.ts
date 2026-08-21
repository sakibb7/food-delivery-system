import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env.js";

export type RefreshTokenPayload = {
  sessionId: string;
};

export type AccessTokenPayload = {
  userId: number;
  sessionId: string;
};

type SignOptionsAndSecret = SignOptions & {
  secret: string;
};

const signDefaults: SignOptions = {
  audience: "user",
};

const verifyDefaults: VerifyOptions = {
  audience: "user",
};

const accessTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "15m",
  secret: JWT_SECRET,
};

export const refreshTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "30d",
  secret: JWT_REFRESH_SECRET,
};

export const signToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options?: SignOptionsAndSecret,
) => {
  const { secret, ...signOpts } = options || accessTokenSignOptions;

  return jwt.sign(payload, secret, {
    ...signDefaults,
    ...signOpts,
  });
};

export const verifyToken = <TPayload extends object = AccessTokenPayload>(
  token: string,
  options?: VerifyOptions & { secret?: string },
) => {
  const { secret = JWT_SECRET, ...verifyOpts } = options || {};

  try {
    const decoded = jwt.verify(token, secret, {
      ...verifyDefaults,
      ...verifyOpts,
    });

    if (typeof decoded === "string") {
      return { error: "Invalid token payload" };
    }

    return { payload: decoded as TPayload };
  } catch (error: any) {
    return { error: error.message };
  }
};
