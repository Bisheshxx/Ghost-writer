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
