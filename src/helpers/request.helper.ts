import { ApiError } from "../utils/apiError";

export const getSingleParam = (
  value: string | string[] | undefined,
  paramName: string,
): string => {
  const normalized = Array.isArray(value) ? value[0] : value;

  if (!normalized) {
    throw new ApiError(
      400,
      `${paramName} route param is required`,
      "BAD_REQUEST",
    );
  }

  return normalized;
};
