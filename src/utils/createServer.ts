import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { Express, Request, Response } from "express";
import session, { SessionOptions } from "express-session";
import corsOptions from "../config/corsOptions";

function createServer() {
  const app: Express = express();

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(cookieParser());

  app.use(
    session({
      secret: process.env.MAINSTACK_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    } as SessionOptions)
  );

  // Basic route
  app.get("/", (req: any, res: any) => {
      return res.json({
          message: 'Mainstack Products Backend...'
      })
  });

  // Serve static files from 'public' directory
  app.use("/public", express.static("public"));

  // Define routes
  // app.use('/api/auth', authRoutes);

  return app;
}

export default createServer;
