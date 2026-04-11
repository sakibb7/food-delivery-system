import express from "express";
import "dotenv/config";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/me.js";
import cors from "cors";
import { NODE_ENV, PORT, CLIENT_WEB_APP_URL } from "./constants/env.js";
import errorHandler from "./middlewares/errorHandler.js";
import authenticate from "./middlewares/authenticate.js";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

const app = express();
app.use(
  cors({
    origin: CLIENT_WEB_APP_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Rate limiting for sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/auth/password/forgot", authLimiter);

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", authenticate, userRoute);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(
    `Auth service is running on port ${PORT} in ${NODE_ENV} environment`,
  );
});
