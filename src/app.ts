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
import { clerkClient, clerkMiddleware } from "@clerk/express";
import webhookRoutes from "./routes/webhook.routes";
import experienceRoutes from "./routes/experience.routes";
import skillsRoutes from "./routes/skills.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.use("/api/v1", webhookRoutes);

app.use(express.json());
app.use(clerkMiddleware());
app.use("/api/v1", experienceRoutes);
app.use("/api/v1", skillsRoutes);

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

app.post("/dev/login", async (req, res, next) => {
  // 1. Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return next(
      new ApiError(404, ROUTE_DOES_NOT_EXIST, ERROR_CODE_ROUTE_NOT_FOUND),
    );
  }

  const { userId } = req.body;
  const template = process.env.CLERK_JWT_TEMPLATE || "postman-dev";
  const expiresInSeconds = Number(process.env.DEV_TOKEN_TTL_SECONDS || 3600);

  try {
    // 2. Create a session for the user
    const session = await clerkClient.sessions.createSession({ userId });

    // 3. Generate a JWT token for that session using a Clerk JWT template
    const { jwt } = await clerkClient.sessions.getToken(
      session.id,
      template,
      expiresInSeconds,
    );

    if (!jwt) {
      return next(
        new ApiError(500, "Failed to generate JWT", "TOKEN_GENERATION_FAILED"),
      );
    }

    return sendSuccessResponse(res, 200, {
      token: jwt,
      template,
      expiresInSeconds,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Couldn't authenticate using Clerk";
    return next(new ApiError(400, message, "AUTHENTICATION_FAILED"));
  }
});

app.use((req: Request, res: Response, next: NextFunction) => {
  void res;
  next(new ApiError(404, ROUTE_DOES_NOT_EXIST, ERROR_CODE_ROUTE_NOT_FOUND));
});

app.use(errorHandler);

export default app;
