import express from "express";
import "dotenv/config";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/me.js";
import cors from "cors";
import { NODE_ENV, PORT } from "./constants/env.js";
import errorHandler from "./middlewares/errorHandler.js";
import authenticate from "./middlewares/authenticate.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", authenticate, userRoute);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(
    `Auth service is running on port ${PORT} in ${NODE_ENV} environment`,
  );
});
