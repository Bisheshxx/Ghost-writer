import type { Response } from "express";
import { ApiResponse } from "../types/api.types";

/**
 * Format a successful API response
 */
export const formatSuccessResponse = <T = any>(data: T): ApiResponse<T> => {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
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

export const sendSuccessResponse = <T = any>(
  res: Response,
  statusCode: number,
  data: T,
) => {
  return res.status(statusCode).json(formatSuccessResponse(data));
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
