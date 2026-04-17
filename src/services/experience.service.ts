import { Experience } from "../models/experience.model";
import { User } from "../models/user.model";
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

export const handleExperienceCreated = async (
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

  const user = await User.findOne({ clerkId }).select("_id");
  if (!user) {
    throw new ApiError(404, "User not found", "NOT_FOUND");
  }

  const docsToInsert = experiences.map((experience) => ({
    ...experience,
    user: user._id,
  }));

  const createdExperiences = await Experience.insertMany(docsToInsert);
  return createdExperiences;
};
