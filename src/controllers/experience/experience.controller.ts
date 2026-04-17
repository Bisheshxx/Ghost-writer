import { getAuth } from "@clerk/express";
import { Response, Request, NextFunction } from "express";
import * as ExperienceService from "../../services/experience.service";
import { sendSuccessResponse } from "../../utils/responseFormatter";
import { ApiError } from "../../utils/apiError";

export const insertExperienceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }

  const data = await ExperienceService.handleExperienceCreated(
    userId,
    req.body.experiences,
  );
  sendSuccessResponse(res, 200, data);
};
