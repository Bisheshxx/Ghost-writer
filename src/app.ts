import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/Errorhandler";
import { ApiError } from "./utils/apiError";
import { asyncHandler } from "./utils/express-async-errors";
import {
  formatSuccessResponse,
  sendSuccessResponse,
} from "./utils/responseFormatter";
import {
  ERROR_CODE_ROUTE_NOT_FOUND,
  ROUTE_DOES_NOT_EXIST,
  SERVER_RUNNING,
} from "./constants/server.messages";
import { clerkMiddleware } from "@clerk/express";
import webhookRoutes from "./routes/webhook.routes";

const app = express();

app.use(helmet()); // Basic security headers
app.use(cors()); // Allow your frontend to talk to this API
app.use(morgan("dev")); // Logger for your terminal

app.use("/api/v1", webhookRoutes);

app.use(express.json()); // Parse JSON bodies for non-webhook routes

// 1. Apply clerkMiddleware globally
// This identifies the user but doesn't block the request yet
app.use(clerkMiddleware());

app.get(
  "/health",
  asyncHandler(async (_req: Request, res: Response) => {
    const data = {
      status: "active",
      version: "1.0.0-ts",
      message: SERVER_RUNNING,
    };
    return sendSuccessResponse(res, 200, data);
  }),
);

app.use((req: Request, res: Response, next: NextFunction) => {
  void res;
  next(new ApiError(404, ROUTE_DOES_NOT_EXIST, ERROR_CODE_ROUTE_NOT_FOUND));
});

app.use(errorHandler);

export default app;
