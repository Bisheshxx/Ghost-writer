import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { ApiError } from "../utils/apiError";

const buildFieldMeta = (path: Array<PropertyKey>) => {
  let index: number | null = null;
  let name = "body";

  for (let i = 0; i < path.length; i++) {
    const part = path[i];
    if (typeof part === "number") {
      index = part;
      const nextPart = path[i + 1];
      if (typeof nextPart === "string") {
        name = nextPart;
      }
      continue;
    }

    if (typeof part === "string") {
      name = part;
    }
  }

  return { index, name };
};

export const validateBody = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsedBody = schema.parse(req.body);
      req.body = parsedBody;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        const message = firstIssue?.message ?? "Invalid request payload";
        const validationErrors = error.issues.map((issue) => ({
          field: buildFieldMeta(issue.path),
          message: issue.message,
          code: issue.code,
        }));

        return next(
          new ApiError(400, message, "BAD_REQUEST", validationErrors),
        );
      }

      return next(error);
    }
  };
};
