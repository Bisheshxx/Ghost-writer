import { z } from "zod";
import { requiredString } from "../helpers/validation.helper";

const TechnicalSkillsSchema = z.object({
  category: requiredString("category"),
  technologies: z.array(requiredString("technologies")),
});

const PersonalSkillSchema = z
  .array(requiredString("personalSkills"))
  .min(1, "At least one personal skill is required");

const AwardsSchema = z.object({
  title: requiredString("title"),
  details: requiredString("details"),
  issuedDate: z.coerce.date().max(new Date(), "Date must be in the past"),
  issuer: requiredString("issuer"),
});

const SkillSchema = z.object({
  technicalSkills: z
    .array(TechnicalSkillsSchema)
    .min(1, "At least one technical skill is required"),
  personalSkills: PersonalSkillSchema,
  awards: z.array(AwardsSchema).optional(),
});
export const addSkillSchema = z.object({ skills: SkillSchema });
