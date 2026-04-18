import { getAuth } from "@clerk/express";
import { Response, Request, NextFunction } from "express";
import { ApiError } from "../../utils/apiError";
import * as QualificationService from "../../services/qualification.service";
import { sendSuccessResponse } from "../../utils/responseFormatter";
import { getSingleParam } from "../../helpers/request.helper";

export const createQualificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const data = await QualificationService.createQualificationService(
    userId,
    req.body.qualification,
  );
  sendSuccessResponse(res, 200, data);
};

export const getQualificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const data = await QualificationService.getQualificationsService(userId);
  sendSuccessResponse(res, 200, data);
};

export const deleteQualificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const qualificationId = getSingleParam(
    req.params.qualificationId,
    "Qualification id",
  );

  const data = await QualificationService.deleteQualificationService(
    userId,
    qualificationId,
  );
  sendSuccessResponse(res, 204, data);
};

export const updateQualificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }
  const qualificationId = getSingleParam(
    req.params.qualificationId,
    "Qualification Id",
  );

  const data = await QualificationService.updateQualificationService(
    userId,
    qualificationId,
    req.body.qualification,
  );
  sendSuccessResponse(res, 200, data);
};
