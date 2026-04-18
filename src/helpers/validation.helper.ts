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

export const validateDateRules = (
  data: { startDate?: string; endDate?: string | null; isCurrent?: boolean },
  ctx: z.RefinementCtx,
) => {
  if (data.isCurrent === true && data.endDate) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "End Date must be null when current is true",
    });
  }

  if (data.startDate && data.endDate) {
    const start = new Date(`${data.startDate}-01T00:00:00.000Z`);
    const end = new Date(`${data.endDate}-01T00:00:00.000Z`);

    if (end < start) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date cannot be earlier than start date",
      });
    }
  }
};
