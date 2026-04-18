import z from "zod";
import { requiredString } from "../helpers/validation.helper";

const ProjectSchema = z.object({
  stack: z
    .array(z.string())
    .min(1, "At least one technology stack is required"),
  projectTitle: requiredString("Project Title"),
  details: z.string().optional(),
});

const CreateProjectGroupSchema = z
  .array(ProjectSchema, {
    error: "Project is required",
  })
  .min(1, "At least one project is required");

const UpdateProjectGroupSchema = ProjectSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required for update",
  },
);

export const CreateProjectSchema = z.object({
  project: CreateProjectGroupSchema,
});

export const UpdateProjectSchema = z.object({
  project: UpdateProjectGroupSchema,
});
