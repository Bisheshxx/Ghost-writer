import z from "zod";
import { MONTH_YEAR_REGEX } from "../constants/regex.string";

export const requiredString = (fieldName: string) =>
  z
    .string({ error: `${fieldName} is required` })
    .trim()
    .min(1, `${fieldName} is required`);

export const monthYearSchema = z
  .string({ error: "startDate is required" })
  .regex(MONTH_YEAR_REGEX, "Date must be in YYYY-MM format");
