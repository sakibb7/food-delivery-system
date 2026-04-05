// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI as string, {
//       dbName: "tomato_db",
//     });

//     console.log("Connected to mongodb");
//   } catch (error) {
//     console.log(error);
//   }
// };

// export default connectDB;

import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL!);
