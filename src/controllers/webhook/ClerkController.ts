import type { NextFunction, Request, Response } from "express";
import { verifyWebhook } from "@clerk/express/webhooks"; // or @clerk/backend
import * as UserService from "../../services/user.service";
import { ApiError } from "../../utils/apiError";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/responseFormatter";

export const handleClerkWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const evt = await verifyWebhook(req);

    const { type, data } = evt;

    switch (type) {
      case "user.created":
      case "user.updated": {
        const { id } = data;
        if (!id) {
          return sendErrorResponse(
            res,
            400,
            "Missing user ID",
            "MISSING_USER_ID",
          );
        }
        const newUser = await UserService.handleUserCreated(id);
        return sendSuccessResponse(res, 201, newUser);
      }
      case "user.deleted": {
        return sendSuccessResponse(res, 200, {
          message: "User deleted event received",
        });
      }
      default:
        return sendSuccessResponse(res, 200, {
          message: "Webhook received",
          data: evt.data,
        });
    }
  } catch (err) {
    if (err instanceof ApiError) {
      return next(err);
    }

    return next(
      new ApiError(
        400,
        "Error verifying webhook",
        "WEBHOOK_VERIFICATION_FAILED",
      ),
    );
  }
};
