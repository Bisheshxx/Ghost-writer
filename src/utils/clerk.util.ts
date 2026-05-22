import { getAuth } from "@clerk/express";
import { Response, Request, NextFunction } from "express";
import { ApiError } from "./apiError";

export const fetchUserId = async (req: Request, next: NextFunction) => {
  const { userId } = await getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  return userId;
};
