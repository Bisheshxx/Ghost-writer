import { z } from "zod";
import { MONTH_YEAR_REGEX } from "../constants/regex.string";

const monthYearSchema = z
  .string()
  .regex(MONTH_YEAR_REGEX, "Date must be in YYYY-MM format");

export const experienceItemSchema = z
  .object({
    companyName: z.string().trim().min(1, "companyName is required"),
    jobTitle: z.string().trim().min(1, "jobTitle is required"),
    Descriptions: z.string().trim().min(1, "Descriptions is required"),
    startDate: monthYearSchema,
    isCurrent: z.boolean().default(false),
    endDate: monthYearSchema.nullable().optional(),
    relavantDetails: z.string().trim().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isCurrent && data.endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "endDate must be null when isCurrent is true",
      });
    }

    if (data.endDate) {
      const start = new Date(`${data.startDate}-01T00:00:00.000Z`);
      const end = new Date(`${data.endDate}-01T00:00:00.000Z`);

      if (end < start) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "endDate cannot be earlier than startDate",
        });
      }
    }
  });

export const addExperienceSchema = z.object({
  experiences: z
    .array(experienceItemSchema)
    .min(1, "At least one experience is required"),
});
