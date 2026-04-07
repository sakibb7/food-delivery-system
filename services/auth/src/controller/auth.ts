import { CREATED, OK } from "../constants/http.js";
import catchErrors from "../utils/catchErrors.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";
import { setAuthCookies } from "../utils/cookies.js";
import { createAccount, loginUser } from "./auth.services.js";

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

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: "Login Successfull" });
});
