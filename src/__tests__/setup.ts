import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Set timeout for all tests
jest.setTimeout(60000);

let mongod: MongoMemoryServer;

// Connect to the in-memory database
beforeAll(async () => {
  try {
    // Close the existing connection if it exists
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  } catch (error) {
    console.error("MongoDB setup error:", error);
    throw error;
  }
});

// Remove and close the db and server
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
});

// Clear all test data after each test
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Mock environment variables
process.env.MONGO_URI = "mongodb://test:27017/test";
process.env.JWT_SECRET = "test-secret";
process.env.NODE_ENV = "test";