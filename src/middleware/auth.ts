import { requireAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

// This acts like a [Authorize] attribute in Dotnet
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return requireAuth()(req, res, (err) => {
    if (err) {
      // If Clerk fails to verify, we pass it to our Global Error Handler
      return next(
        new ApiError(401, "Unauthorized: Please log in to continue."),
      );
    }
    next();
  });
};
