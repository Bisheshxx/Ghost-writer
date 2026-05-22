import { Response, Request, NextFunction } from "express";
import { fetchUserId } from "../../utils/clerk.util";
import * as CoverLetterService from "../../services/cover-lettter.service";
import { sendSuccessResponse } from "../../utils/responseFormatter";

export const generateCoverLetterController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = await fetchUserId(req, next);

  const data = await CoverLetterService.generateCoverLetterService(
    userId!,
    req.body.jobDescription,
  );
  sendSuccessResponse(res, 200, data);
};
