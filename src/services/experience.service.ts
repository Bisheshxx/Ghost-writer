import { Experience } from "../models/experience.model";
import { resolveUserIdByClerkId } from "./user.service";
import { IExperience } from "../types/experience.types";
import { ApiError } from "../utils/apiError";

export type ExperienceInput = Pick<
  IExperience,
  | "companyName"
  | "jobTitle"
  | "Descriptions"
  | "startDate"
  | "isCurrent"
  | "endDate"
  | "relavantDetails"
>;

export const createdExperiencesService = async (
  clerkId: string,
  experiences: ExperienceInput[],
) => {
  if (!Array.isArray(experiences) || experiences.length === 0) {
    throw new ApiError(
      400,
      "At least one experience is required",
      "BAD_REQUEST",
    );
  }

  const userId = await resolveUserIdByClerkId(clerkId);

  const docsToInsert = experiences.map((experience) => ({
    ...experience,
    user: userId,
  }));

  const createdExperiences = await Experience.insertMany(docsToInsert);
  return createdExperiences;
};

export const getExperienceService = async (clerkId: string) => {
  const userId = await resolveUserIdByClerkId(clerkId);
  const experiences = await Experience.find({ user: userId }).sort({
    startDate: -1,
  });

  return experiences;
};

export const updateExperienceService = async (
  clerkId: string,
  experienceId: string,
  updates: Partial<ExperienceInput>,
) => {
  const userId = await resolveUserIdByClerkId(clerkId);

  const allowedFields: Array<keyof ExperienceInput> = [
    "companyName",
    "jobTitle",
    "Descriptions",
    "startDate",
    "isCurrent",
    "endDate",
    "relavantDetails",
  ];

  const updatePayload = Object.fromEntries(
    Object.entries(updates).filter(
      ([key, value]) =>
        allowedFields.includes(key as keyof ExperienceInput) &&
        value !== undefined,
    ),
  ) as Partial<ExperienceInput>;

  if (Object.keys(updatePayload).length === 0) {
    throw new ApiError(
      400,
      "No valid fields provided for update",
      "BAD_REQUEST",
    );
  }

  const experience = await Experience.findOne({
    _id: experienceId,
    user: userId,
  });

  if (!experience) {
    throw new ApiError(404, "Experience not found", "NOT_FOUND");
  }

  experience.set(updatePayload);
  const updatedExperience = await experience.save();
  return updatedExperience;
};

export const deleteExperienceService = async (
  clerkId: string,
  experienceId: string,
) => {
  const userId = await resolveUserIdByClerkId(clerkId);
  const experience = await Experience.findOne({
    _id: experienceId,
    user: userId,
  });
  if (!experience) {
    throw new ApiError(404, "Experience not found", "NOT_FOUND");
  }
  await experience.deleteOne();
  return null;
};
