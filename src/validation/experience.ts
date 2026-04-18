import { z } from "zod";
import { MONTH_YEAR_REGEX } from "../constants/regex.string";
import { monthYearSchema, requiredString } from "../helpers/validation.helper";

const experienceFieldsSchema = z.object({
  companyName: requiredString("company name"),
  jobTitle: requiredString("job title"),
  Descriptions: requiredString("Descriptions"),
  startDate: monthYearSchema,
  isCurrent: z.boolean(),
  endDate: monthYearSchema.nullable().optional(),
  relavantDetails: z.string().trim().nullable().optional(),
});

const validateDateRules = (
  data: { startDate?: string; endDate?: string | null; isCurrent?: boolean },
  ctx: z.RefinementCtx,
) => {
  if (data.isCurrent === true && data.endDate) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "endDate must be null when isCurrent is true",
    });
  }

  if (data.startDate && data.endDate) {
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
};

export const experienceItemSchema = experienceFieldsSchema.superRefine(
  (data, ctx) => {
    validateDateRules(data, ctx);
  },
);

export const addExperienceSchema = z.object({
  experiences: z
    .array(experienceItemSchema)
    .min(1, "At least one experience is required"),
});

export const patchExperienceSchema = experienceFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  })
  .superRefine((data, ctx) => {
    validateDateRules(data, ctx);
  });
