import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDatabase() {
  if (!config.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");
  await mongoose.connect(config.MONGODB_URI, {
    dbName: config.MONGODB_DB_NAME,
    serverSelectionTimeoutMS: 8000,
  });
  return mongoose.connection;
}
