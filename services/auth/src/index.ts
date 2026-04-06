import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoute);

app.listen(PORT, async () => {
  console.log(`Auth service is running on port ${PORT}`);
  console.log("DB URL:", process.env.DATABASE_URL);
});
