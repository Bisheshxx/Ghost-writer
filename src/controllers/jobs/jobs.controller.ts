import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { getSingleParam } from "../../helpers/request.helper";
import * as JobsService from "../../services/jobs.service";
import { ApiError } from "../../utils/apiError";
import { sendSuccessResponse } from "../../utils/responseFormatter";
import { ListJobsQuerySchema } from "../../validation/jobs.validate";

const getAuthenticatedUserId = (req: Request, next: NextFunction) => {
  const { userId } = getAuth(req);

  if (!userId) {
    next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
    return null;
  }

  return userId;
};

export const listJobsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = getAuthenticatedUserId(req, next);
  if (!userId) {
    return;
  }

  const parsedQuery = ListJobsQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    const firstIssue = parsedQuery.error.issues[0];
    return next(
      new ApiError(
        400,
        firstIssue?.message ?? "Invalid jobs query",
        "BAD_REQUEST",
      ),
    );
  }

  const { data, meta } = await JobsService.listJobsService(
    userId,
    parsedQuery.data,
  );
  return sendSuccessResponse(res, 200, data, meta);
};

export const createJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = getAuthenticatedUserId(req, next);
  if (!userId) {
    return;
  }

  const data = await JobsService.createJobService(userId, req.body);
  return sendSuccessResponse(res, 201, data);
};

export const getJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = getAuthenticatedUserId(req, next);
  if (!userId) {
    return;
  }

  const jobId = getSingleParam(req.params.id, "Job Id");
  const data = await JobsService.getJobService(userId, jobId);
  return sendSuccessResponse(res, 200, data);
};

export const updateJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = getAuthenticatedUserId(req, next);
  if (!userId) {
    return;
  }

  const jobId = getSingleParam(req.params.id, "Job Id");
  const data = await JobsService.updateJobService(userId, jobId, req.body);
  return sendSuccessResponse(res, 200, data);
};

export const updateJobStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = getAuthenticatedUserId(req, next);
  if (!userId) {
    return;
  }

  const jobId = getSingleParam(req.params.id, "Job Id");
  const data = await JobsService.updateJobStatusService(
    userId,
    jobId,
    req.body.status,
  );
  return sendSuccessResponse(res, 200, data);
};

export const deleteJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = getAuthenticatedUserId(req, next);
  if (!userId) {
    return;
  }

  const jobId = getSingleParam(req.params.id, "Job Id");
  const data = await JobsService.deleteJobService(userId, jobId);
  return sendSuccessResponse(res, 204, data);
};

export const generateJobContentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = getAuthenticatedUserId(req, next);
  if (!userId) {
    return;
  }

  const jobId = getSingleParam(req.params.id, "Job Id");
  const data = await JobsService.generateJobContentService(userId, jobId);
  return sendSuccessResponse(res, 200, data);
};
