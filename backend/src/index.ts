import express from "express";
import "dotenv/config";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";
import restaurantRoute from "./routes/restaurant.js";
import menuRoute from "./routes/menu.js";
import orderRoute from "./routes/order.js";
import addressRoute from "./routes/address.js";
import riderRoute from "./routes/rider.js";
import reviewRoute from "./routes/review.js";
import cors from "cors";
import { NODE_ENV, PORT, CLIENT_WEB_APP_URL } from "./constants/env.js";
import errorHandler from "./middlewares/errorHandler.js";
import authenticate from "./middlewares/authenticate.js";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import cloudinary from "cloudinary";
import uploadRoutes from "./routes/cloudinary.js";

const app = express();
app.use(
  cors({
    // origin: CLIENT_WEB_APP_URL,
    origin: ["http://localhost:5173", CLIENT_WEB_APP_URL],
    credentials: true,
  }),
);
app.use(
  express.json({
    limit: "10mb",
  }),
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_SECRET_KEY } = process.env;

if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_SECRET_KEY) {
  throw new Error("Missing Cloudinary environment variables");
}

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_SECRET_KEY,
});

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
app.use("/api/v1/restaurant", restaurantRoute);
app.use("/api/v1/cloudinary", authenticate, uploadRoutes);
app.use("/api/v1/menu", menuRoute);
app.use("/api/v1/order", authenticate, orderRoute);
app.use("/api/v1/address", authenticate, addressRoute);
app.use("/api/v1/rider", authenticate, riderRoute);
app.use("/api/v1/review", authenticate, reviewRoute);

// Add this AFTER all your app.use() route registrations
app.get("/debug-routes", (req, res) => {
  const routes: string[] = [];
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      routes.push(middleware.route.path);
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          routes.push(handler.route.path);
        }
      });
    }
  });
  res.json(routes);
});
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(
    `Auth service is running on port ${PORT} in ${NODE_ENV} environment`,
  );
});
