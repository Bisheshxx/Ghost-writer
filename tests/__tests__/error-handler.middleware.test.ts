import { Request, Response } from "express";
import { errorHandler } from "../../src/middleware/Errorhandler";
import { ApiError } from "../../src/utils/apiError";
import {
  ERROR_CODE_INTERNAL,
  ERROR_CODE_NOT_FOUND,
  ERROR_MESSAGE_INTERNAL,
  ERROR_MESSAGE_NOT_FOUND,
} from "../../src/constants/server.messages";

describe("errorHandler middleware", () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  const createMockRes = () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn().mockReturnThis();
    return { status, json } as unknown as Response;
  };

  it("returns ApiError status/message/code when provided", () => {
    const req = { method: "GET", path: "/test" } as Request;
    const res = createMockRes();
    const next = jest.fn();
    const err = new ApiError(409, "Conflict happened", "CONFLICT");

    errorHandler(err, req, res, next);

    expect(res.status as jest.Mock).toHaveBeenCalledWith(409);
    expect(res.json as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          message: "Conflict happened",
          code: "CONFLICT",
        },
      }),
    );
    expect((res.json as jest.Mock).mock.calls[0][0].timestamp).toEqual(
      expect.any(String),
    );
  });

  it("uses status fallback code when ApiError code is missing", () => {
    const req = { method: "GET", path: "/missing" } as Request;
    const res = createMockRes();
    const next = jest.fn();
    const err = new ApiError(404, ERROR_MESSAGE_NOT_FOUND);

    errorHandler(err, req, res, next);

    expect(res.status as jest.Mock).toHaveBeenCalledWith(404);
    expect(res.json as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          message: ERROR_MESSAGE_NOT_FOUND,
          code: ERROR_CODE_NOT_FOUND,
        },
      }),
    );
  });

  it("returns internal fallback for non-ApiError", () => {
    const req = { method: "POST", path: "/explode" } as Request;
    const res = createMockRes();
    const next = jest.fn();
    const err = new Error("Unexpected failure");

    errorHandler(err, req, res, next);

    expect(res.status as jest.Mock).toHaveBeenCalledWith(500);
    expect(res.json as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          message: ERROR_MESSAGE_INTERNAL,
          code: ERROR_CODE_INTERNAL,
        },
      }),
    );
  });
});
