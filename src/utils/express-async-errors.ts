import { Request, Response, NextFunction } from "express";
import { ApiError } from "./apiError";

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncRouteHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: unknown) => {
      if (error instanceof Error) {
        next(error);
        return;
      }

      next(
        new ApiError(
          500,
          "Something went wrong. Please try again.",
          "INTERNAL_ERROR",
        ),
      );
    });
  };
