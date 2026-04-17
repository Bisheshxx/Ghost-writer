export class ApiError extends Error {
  statusCode: number;
  code?: string;
  validationErrors?: Array<{
    field: {
      index: number | null;
      name: string;
    };
    message: string;
    code: string;
  }>;

  constructor(
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
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.validationErrors = validationErrors;
    Error.captureStackTrace(this, this.constructor);
  }
}
