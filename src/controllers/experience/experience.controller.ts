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

  const data = await ExperienceService.createdExperiencesService(
    userId,
    req.body.experiences,
  );
  sendSuccessResponse(res, 200, data);
};

export const getExperienceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const data = await ExperienceService.getExperienceService(userId);
  sendSuccessResponse(res, 200, data);
};

export const updateExperienceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }

  const experienceId = Array.isArray(req.params.experienceId)
    ? req.params.experienceId[0]
    : req.params.experienceId;

  if (!experienceId) {
    return next(
      new ApiError(400, "experienceId route param is required", "BAD_REQUEST"),
    );
  }

  const data = await ExperienceService.updateExperienceService(
    userId,
    experienceId,
    req.body,
  );

  sendSuccessResponse(res, 200, data);
};

export const deleteExperienceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const experienceId = req.params.experienceId as string;
  if (!experienceId) {
    return next(
      new ApiError(400, "experienceId route param is required", "BAD_REQUEST"),
    );
  }

  const data = await ExperienceService.deleteExperienceService(
    userId,
    experienceId,
  );
  sendSuccessResponse(res, 204, data);
};
