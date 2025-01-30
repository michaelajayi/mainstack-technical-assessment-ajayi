import mongoose from "mongoose";
import logger from "../utils/logger"; // Import your logger

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async (): Promise<void> => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(MONGO_URI, {
      directConnection: true, 
    });

    logger.info("MongoDB Connected...");
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

export default connectDB;
