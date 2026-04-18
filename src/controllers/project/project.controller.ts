import { getAuth } from "@clerk/express";
import { Response, Request, NextFunction } from "express";
import { ApiError } from "../../utils/apiError";
import * as ProjectService from "../../services/projects.service";
import { sendSuccessResponse } from "../../utils/responseFormatter";
import { getSingleParam } from "../../helpers/request.helper";
export const createProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const data = await ProjectService.createProjectService(
    userId,
    req.body.project,
  );
  sendSuccessResponse(res, 200, data);
};

export const getProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const data = await ProjectService.getProjectService(userId);
  sendSuccessResponse(res, 200, data);
};

export const deleteProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const projectId = getSingleParam(req.params.projectId, "projectId");
  if (!projectId) {
    return next(
      new ApiError(400, "Project Id route param is required", "BAD_REQUEST"),
    );
  }
  const data = await ProjectService.deleteProjectService(userId, projectId);
  sendSuccessResponse(res, 204, data);
};

export const updateProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const projectId = getSingleParam(req.params.projectId, "Project Id");
  if (!projectId) {
    return next(
      new ApiError(400, "Project Id route param is required", "BAD_REQUEST"),
    );
  }
  const data = await ProjectService.updateProjectService(
    userId,
    projectId,
    req.body.project,
  );
  sendSuccessResponse(res, 200, data);
};
