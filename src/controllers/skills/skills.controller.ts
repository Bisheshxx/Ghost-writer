import { NextFunction, Request, Response } from "express";
import * as SkillsService from "../../services/skills.service";
import { getAuth } from "@clerk/express";
import { ApiError } from "../../utils/apiError";
import { sendSuccessResponse } from "../../utils/responseFormatter";
import { getSingleParam } from "../../helpers/request.helper";
import { SkillName, SkillsInput } from "../../types/skills.types";

export const insertSkillsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const data = await SkillsService.createSkillsService(userId, req.body.skills);
  sendSuccessResponse(res, 200, data);
};

export const getSkillsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const data = await SkillsService.getSkillsService(userId);
  sendSuccessResponse(res, 200, data);
};

export const updatePersonalSkillController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const skillId = getSingleParam(req.params.skillId, "skillId");

  const skillValue = req.body.personalSkills;
  const data = await SkillsService.updateSkillByName(
    userId,
    skillId,
    "personalSkills",
    skillValue,
  );
  sendSuccessResponse(res, 200, data);
};

export const updateTechnicalSkillsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const skillId = getSingleParam(req.params.skillId, "skillId");

  const skillValue = req.body.technicalSkills;
  const data = await SkillsService.updateSkillByName(
    userId,
    skillId,
    "technicalSkills",
    skillValue,
  );
  sendSuccessResponse(res, 200, data);
};
export const updateAwardsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const skillId = getSingleParam(req.params.skillId, "skillId");

  const skillValue = req.body.awards;
  const data = await SkillsService.updateSkillByName(
    userId,
    skillId,
    "awards",
    skillValue,
  );
  sendSuccessResponse(res, 200, data);
};
