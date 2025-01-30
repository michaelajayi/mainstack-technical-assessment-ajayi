import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { Express, Request, Response } from "express";
import session, { SessionOptions } from "express-session";
import config from "./config";
import corsOptions from "./config/corsOptions";
import connectDB from "./config/db";
import { errorHandler, notFoundHandler } from "./middlewares/errors";
import { v1Router } from "./routes";
import logger from "./utils/logger";

const app: Express = express();
const port = config.port.app || 8001;

// Connect to MongoDB
try {
  connectDB();
} catch (err) {
  logger.error(err);
}

// Middlewares
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());
app.use(cookieParser());

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express server with TypeScript!");
});

// Define routes
app.use("/api/v1", v1Router);

// Serve static files from the 'public' folder
app.use("/public", express.static("public"));

// Error handling
app.use("*", notFoundHandler);
app.use(errorHandler as express.ErrorRequestHandler);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
