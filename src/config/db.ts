import mongoose from "mongoose";
import config from ".";
import logger from "../utils/logger"; // Import your logger

const mongo_uri = config.mongo.uri;

const connectDB = async (): Promise<void> => {
  try {
    if (!mongo_uri) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(mongo_uri, {
      // directConnection: true,
    });

    logger.info("MongoDB Connected...");
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

export default connectDB;
