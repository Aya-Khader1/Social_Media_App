import mongoose from "mongoose";
import { env } from "./../config/config";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      //serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected:${conn.connection.host}`);
  } catch (error) {
    console.log(`MongoDB Connection error:${(error as Error).message}`);
    throw error;
  }
};

export default connectDB;
