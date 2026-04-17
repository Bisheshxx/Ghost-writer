import { getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  void res;
  const auth = getAuth(req);
  const userId = "userId" in auth ? auth.userId : undefined;

  if (!userId) {
    return next(
      new ApiError(
        401,
        "Unauthorized: Please log in to continue.",
        "UNAUTHORIZED",
      ),
    );
  }

  return next();
};
