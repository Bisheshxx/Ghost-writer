import { MONTH_YEAR_REGEX } from "../constants/regex.string";

export const monthYearValidator = {
  validator: (value: string) => MONTH_YEAR_REGEX.test(value),
  message: "Date must be in YYYY-MM format",
};

export const nullableMonthYearValidator = {
  validator: (value: string | null | undefined) =>
    value == null || MONTH_YEAR_REGEX.test(value),
  message: "Date must be null/undefined or in YYYY-MM format",
};
