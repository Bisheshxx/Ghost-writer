import z from "zod";
import { requiredString } from "../helpers/validation.helper";
import { JOB_STATUSES } from "../types/job.types";

export const JobStatusSchema = z.enum(JOB_STATUSES);

const JobBaseSchema = z.object({
  company: requiredString("Company"),
  title: requiredString("Title"),
  description: requiredString("Description"),
  location: requiredString("Location"),
  link: requiredString("Link"),
  status: JobStatusSchema.optional(),
});

export const CreateJobSchema = JobBaseSchema.extend({
  status: JobStatusSchema.optional().default("Empty"),
});

export const UpdateJobSchema = JobBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required for update",
  },
);

export const UpdateJobStatusSchema = z.object({
  status: JobStatusSchema,
});

const positiveIntegerFromQuery = (field: string, defaultValue: number) =>
  z
    .preprocess(
      (value) => (value === undefined ? defaultValue : value),
      z.coerce
        .number({
          error: `${field} must be a number`,
        })
        .int(`${field} must be an integer`)
        .positive(`${field} must be greater than 0`),
    )
    .default(defaultValue);

export const ListJobsQuerySchema = z.object({
  page: positiveIntegerFromQuery("Page", 1),
  limit: positiveIntegerFromQuery("Limit", 10),
  search: z
    .preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().trim().optional(),
    )
    .optional(),
  status: JobStatusSchema.optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
