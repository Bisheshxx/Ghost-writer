import { Skills } from "../models/skills.model";
import { SkillName, SkillsInput } from "../types/skills.types";
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

export const getSkillByName = async (
  clerkId: string,
  skillId: string,
  skillName: SkillName,
) => {
  const userId = await resolveUserIdByClerkId(clerkId);
  const skills = await Skills.findOne({
    _id: skillId,
    user: userId,
  }).select(skillName);

  if (!skills) {
    throw new ApiError(404, "Skills not found", "NOT_FOUND");
  }
  return skills;
};

export const updateSkillByName = async (
  clerkId: string,
  skillId: string,
  skillName: SkillName,
  skillValue: SkillsInput[SkillName],
) => {
  if (skillValue === undefined) {
    throw new ApiError(400, `${skillName} cannot be empty`, "BAD_REQUEST");
  }

  const userId = await resolveUserIdByClerkId(clerkId);
  const updatePayload = {
    [skillName]: skillValue,
  } as Partial<SkillsInput>;

  const updatedSkills = await Skills.findOneAndUpdate(
    {
      _id: skillId,
      user: userId,
    },
    {
      $set: updatePayload,
    },
    {
      new: true,
      runValidators: true,
    },
  ).select(skillName);

  if (!updatedSkills) {
    throw new ApiError(404, "Skills not found", "NOT_FOUND");
  }

  return updatedSkills;
};
