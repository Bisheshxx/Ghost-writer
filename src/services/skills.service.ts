import { Skills } from "../models/skills.model";
import { SkillsInput } from "../types/skills.types";
import { ApiError } from "../utils/apiError";
import { resolveUserIdByClerkId } from "./user.service";

export const createSkillsService = async (
  clerkId: string,
  skills: SkillsInput,
) => {
  if (!skills) {
    throw new ApiError(400, "Skills cannot be empty", "BAD_REQUEST");
  }
  const userId = await resolveUserIdByClerkId(clerkId);

  const payload = {
    user: userId,
    ...skills,
  };
  const createdSkills = await Skills.insertOne(payload);
  return createdSkills;
};

export const getSkillsService = async (clerkId: string) => {
  const userId = await resolveUserIdByClerkId(clerkId);
  const skills = await Skills.find({
    user: userId,
  }).sort({
    createdAt: -1,
  });
  return skills;
};
