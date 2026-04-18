import { NextFunction, Request, Response } from "express";
import * as SkillsService from "../../services/skills.service";
import { getAuth } from "@clerk/express";
import { ApiError } from "../../utils/apiError";
import { sendSuccessResponse } from "../../utils/responseFormatter";

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
