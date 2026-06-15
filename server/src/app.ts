import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRouter from "./modules/auth/auth.routes";
import productRouter from "./features/product/product.routes";
import publishProductRouter from "./modules/publishProduct/publisProduct.routes";
import { registerPublicMiddleware } from "./public-middleware";

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
].filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman, mobile apps, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked Origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));
app.use(helmet());

app.use("/api/auth", authRouter);
app.use("/api/product", productRouter);
app.use("/api/publish", publishProductRouter);

registerPublicMiddleware(app);

export default app;