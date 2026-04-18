import z from "zod";
import {
  monthYearSchema,
  requiredString,
  validateDateRules,
} from "../helpers/validation.helper";

const QualificationSchema = z.object({
  qualification: requiredString("Qualification"),
  descriptions: requiredString("Descriptions"),
  instituteName: requiredString("Institute name"),
  relavantDetails: requiredString("Relavant details"),
  startDate: monthYearSchema,
  endDate: monthYearSchema.nullable().optional(),
  isCurrent: z.boolean(),
});

export const QualificationItemSchema = QualificationSchema.superRefine(
  (data, ctx) => validateDateRules(data, ctx),
);

export const CreateQualificationSchema = z.object({
  qualification: z
    .array(QualificationItemSchema)
    .min(1, "At least one qualification is required"),
});

export const UpdateQualificationSchema = z.object({
  qualification: QualificationSchema.partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    })
    .superRefine((data, ctx) => {
      validateDateRules(data, ctx);
    }),
});
