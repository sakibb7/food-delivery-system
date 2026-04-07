import { Request, Response } from "express";
import { Pool } from "pg";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema/userSchema.js";
import { eq } from "drizzle-orm";
import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
} from "../constants/http.js";
import catchErrors from "../utils/catchErrors.js";
import { registerSchema } from "./auth.schemas.js";
import { setAuthCookies } from "../utils/cookies.js";
import { createAccount } from "./auth.services.js";
// import User from "../model/User.js";
// import jwt from "jsonwebtoken";
// import TryCatch from "../middlewares/trycatch.js";
// import { AuthenticatedRequest } from "../middlewares/isAuth.js";
// import { oauth2client } from "../config/googleConfig.js";
// import axios from "axios";

// export const loginUser = TryCatch(async (req, res) => {
//   const { code } = req.body;

//   if (!code) {
//     return res.status(400).json({
//       message: "Authorization code is required",
//     });
//   }

//   const googleRes = await oauth2client.getToken(code);

//   oauth2client.setCredentials(googleRes.tokens);

//   const userRes = await axios.get(
//     `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`,
//   );

//   const { email, name, picture } = userRes.data;

//   let user = await User.findOne({ email });

//   if (!user) {
//     user = await User.create({
//       name,
//       email,
//       image: picture,
//     });
//   }

//   const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
//     expiresIn: "7d",
//   });

//   res.status(200).json({
//     message: "Logged Success",
//     token,
//     user,
//   });
// });

// const allowedRoles = ["customer", "rider", "seller"] as const;
// type Role = (typeof allowedRoles)[number];

// export const addUserRole = TryCatch(async (req: AuthenticatedRequest, res) => {
//   if (!req.user?._id) {
//     return res.status(401).json({
//       message: "Unauthorized",
//     });
//   }

//   const { role } = req.body as { role: Role };

//   if (!allowedRoles.includes(role)) {
//     return res.status(400).json({
//       message: "Invalid Role",
//     });
//   }

//   console.log(req?.user, "User data");

//   const user = await User.findByIdAndUpdate(
//     req.user?._id,
//     { role },
//     { new: true },
//   );

//   if (!user) {
//     return res.status(404).json({
//       message: "User not found",
//     });
//   }

//   const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
//     expiresIn: "7d",
//   });

//   res.json({ user, token });
// });

// export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
//   const user = req.user;
//   res.json(user);
// });

// export async function createUser(req: Request, res: Response) {
//   const { name, email } = req.body;

//   try {
// const existingUser = await db
//   .select()
//   .from(usersTable)
//   .where(eq(usersTable.email, email));

//     if (existingUser.length > 0) {
//       return res.status(BAD_REQUEST).json({ message: "Email Already exists" });
//     }

//     await db.insert(usersTable).values({
//       name,
//       email,
//     });

//     res.status(CREATED).json({ message: "User created" });
//   } catch (error) {
//     res
//       .status(INTERNAL_SERVER_ERROR)
//       .json({ message: "Failed to create user" });
//   }
// }

export const registerHandler = catchErrors(async (req, res) => {
  //validate request
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  console.log(request);

  //call service
  const { user, accessToken, refreshToken } = await createAccount(request);

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json(user);
});
