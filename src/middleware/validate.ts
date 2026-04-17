import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { ApiError } from "../utils/apiError";

export const validateBody = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsedBody = schema.parse(req.body);
      req.body = parsedBody;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new ApiError(
            400,
            error.issues[0]?.message ?? "Invalid request payload",
            "BAD_REQUEST",
          ),
        );
      }

      return next(error);
    }
  };
};
