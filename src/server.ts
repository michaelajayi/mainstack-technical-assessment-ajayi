import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { Express, Request, Response } from "express";
import session, { SessionOptions } from "express-session";
import corsOptions from "./config/corsOptions";
import connectDB from "./config/db";

const app: Express = express();
const port = process.env.port || 8001;

// Connect to MongoDB
try {
  connectDB();
} catch (err) {
  console.error(err);
}

// Middlewares
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  } as SessionOptions)
);

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express server with TypeScript!");
});

// Serve static files from the 'public' folder
app.use("/public", express.static("public"));

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
