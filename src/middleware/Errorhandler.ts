import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../types/api.types";
import {
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_CONFLICT,
  ERROR_CODE_FORBIDDEN,
  ERROR_CODE_INTERNAL,
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_RATE_LIMITED,
  ERROR_CODE_UNAUTHORIZED,
  ERROR_CODE_VALIDATION,
  ERROR_MESSAGE_BAD_REQUEST,
  ERROR_MESSAGE_CONFLICT,
  ERROR_MESSAGE_FORBIDDEN,
  ERROR_MESSAGE_INTERNAL,
  ERROR_MESSAGE_NOT_FOUND,
  ERROR_MESSAGE_RATE_LIMITED,
  ERROR_MESSAGE_UNAUTHORIZED,
  ERROR_MESSAGE_VALIDATION,
} from "../constants/server.messages";
import { formatErrorResponse } from "../utils/responseFormatter";

const getFallbackMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return ERROR_MESSAGE_BAD_REQUEST;
    case 401:
      return ERROR_MESSAGE_UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGE_FORBIDDEN;
    case 404:
      return ERROR_MESSAGE_NOT_FOUND;
    case 409:
      return ERROR_MESSAGE_CONFLICT;
    case 422:
      return ERROR_MESSAGE_VALIDATION;
    case 429:
      return ERROR_MESSAGE_RATE_LIMITED;
    default:
      return ERROR_MESSAGE_INTERNAL;
  }
};

const getFallbackCode = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return ERROR_CODE_BAD_REQUEST;
    case 401:
      return ERROR_CODE_UNAUTHORIZED;
    case 403:
      return ERROR_CODE_FORBIDDEN;
    case 404:
      return ERROR_CODE_NOT_FOUND;
    case 409:
      return ERROR_CODE_CONFLICT;
    case 422:
      return ERROR_CODE_VALIDATION;
    case 429:
      return ERROR_CODE_RATE_LIMITED;
    default:
      return ERROR_CODE_INTERNAL;
  }
};

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  void next;
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const isApiError = err instanceof ApiError;
  const message = isApiError
    ? err.message || getFallbackMessage(statusCode)
    : getFallbackMessage(statusCode);
  const code = isApiError
    ? err.code || getFallbackCode(statusCode)
    : getFallbackCode(statusCode);

  const response: ApiResponse = formatErrorResponse(message, code);

  // Keep internal details in server logs, not in API response.
  console.error(`[Request Error] ${req.method} ${req.path} >>`, err);

  res.status(statusCode).json(response);
};
