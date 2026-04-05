import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.js";
import cors from "cors";
import { usersTable } from "./db/schema.js";
import { db } from "./config/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoute);

app.listen(PORT, async () => {
  const user: typeof usersTable.$inferInsert = {
    name: "John",
    age: 30,
    email: "john@example.com",
  };
  await db.insert(usersTable).values(user);
  console.log("New user created!");
  console.log(`Auth service is running on port ${PORT}`);
});
