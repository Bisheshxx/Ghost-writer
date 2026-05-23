import type { Response } from "express";
import { ApiResponse } from "../types/api.types";

export const formatSuccessResponse = <T, M>(data: T, meta?: M): ApiResponse => {
  const timestamp = new Date().toISOString();

  return {
    success: true,
    data,
    timestamp,
    ...(meta !== undefined ? { meta } : {}),
  };
};

/**
 * Format an error API response
 */
export const formatErrorResponse = (
  message: string,
  code?: string,
  validationErrors?: Array<{
    field: {
      index: number | null;
      name: string;
    };
    message: string;
    code: string;
  }>,
): ApiResponse => {
  return {
    success: false,
    error: {
      message,
      code,
      ...(validationErrors ? { validationErrors } : {}),
    },
    timestamp: new Date().toISOString(),
  };
};

export const sendSuccessResponse = <T, M>(
  res: Response,
  statusCode: number,
  data: T,
  meta?: M,
) => {
  return res.status(statusCode).json(formatSuccessResponse(data, meta));
};

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  code?: string,
  validationErrors?: Array<{
    field: {
      index: number | null;
      name: string;
    };
    message: string;
    code: string;
  }>,
) => {
  return res
    .status(statusCode)
    .json(formatErrorResponse(message, code, validationErrors));
};
