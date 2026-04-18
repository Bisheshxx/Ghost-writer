import { z } from "zod";
import { MONTH_YEAR_REGEX } from "../constants/regex.string";
import {
  monthYearSchema,
  requiredString,
  validateDateRules,
} from "../helpers/validation.helper";

const experienceFieldsSchema = z.object({
  companyName: requiredString("company name"),
  jobTitle: requiredString("job title"),
  Descriptions: requiredString("Descriptions"),
  startDate: monthYearSchema,
  isCurrent: z.boolean(),
  endDate: monthYearSchema.nullable().optional(),
  relavantDetails: z.string().trim().nullable().optional(),
});

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
