import { z } from "zod";
import { requiredString } from "../helpers/validation.helper";

const TechnicalSkillsGroupSchema = z.object({
  category: requiredString("category"),
  technologies: z.array(requiredString("technologies")),
});

const PersonalSkillGroupSchema = z
  .array(requiredString("personalSkills"))
  .min(1, "At least one personal skill is required");

const AwardsGroupSchema = z.object({
  title: requiredString("title"),
  details: requiredString("details"),
  issuedDate: z.coerce.date().max(new Date(), "Date must be in the past"),
  issuer: requiredString("issuer"),
});

const SkillSchema = z.object({
  technicalSkills: z
    .array(TechnicalSkillsGroupSchema, {
      error: "technicalSkills is required",
    })
    .min(1, "At least one technical skill is required"),
  personalSkills: PersonalSkillGroupSchema,
  awards: z
    .array(AwardsGroupSchema, {
      error: "awards is required",
    })
    .min(1, "At least one award is required")
    .optional(),
});
export const addSkillSchema = z.object({ skills: SkillSchema });
export const updateTechnicalSkillSchema = z.object({
  technicalSkills: z
    .array(TechnicalSkillsGroupSchema, {
      error: "technicalSkills is required",
    })
    .min(1, "At least one technical skill is required"),
});
export const updatePersonalSkillsSchema = z.object({
  personalSkills: z
    .array(requiredString("personalSkills"), {
      error: "personalSkills is required",
    })
    .min(1, "At least one personal skill is required"),
});
export const updateAwardSkillsSchema = z.object({
  awards: z
    .array(AwardsGroupSchema, {
      error: "awards is required",
    })
    .min(1, "At least one award is required"),
});
