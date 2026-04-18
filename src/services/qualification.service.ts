import { Qualification } from "../models/qualification.model";
import { QualificationPayload } from "../types/qualification.types";
import { ApiError } from "../utils/apiError";
import { resolveUserIdByClerkId } from "./user.service";

export const createQualificationService = async (
  clerkId: string,
  qualifications: QualificationPayload[],
) => {
  if (!Array.isArray(qualifications) || qualifications.length === 0) {
    throw new ApiError(
      400,
      "At least one qualification is required",
      "BAD_REQUEST",
    );
  }
  const userId = await resolveUserIdByClerkId(clerkId);
  const docsToInsert = qualifications.map((qualification) => ({
    ...qualification,
    user: userId,
  }));
  const createdProjects = await Qualification.insertMany(docsToInsert);
  return createdProjects;
};

export const getQualificationsService = async (clerkId: string) => {
  const userId = await resolveUserIdByClerkId(clerkId);
  const project = await Qualification.find({ user: userId });
  return project;
};

export const deleteQualificationService = async (
  clerkId: string,
  qualificationId: string,
) => {
  const userId = await resolveUserIdByClerkId(clerkId);
  const qualification = await Qualification.findOne({
    _id: qualificationId,
    user: userId,
  });
  if (!qualification) {
    throw new ApiError(404, "Qualification not found", "NOT_FOUND");
  }
  await qualification.deleteOne();
  return null;
};

export const updateQualificationService = async (
  clerkId: string,
  qualificationId: string,
  update: Partial<QualificationPayload>,
) => {
  const userId = await resolveUserIdByClerkId(clerkId);
  const allowedFields: Array<keyof QualificationPayload> = [
    "qualification",
    "descriptions",
    "startDate",
    "isCurrent",
    "endDate",
    "instituteName",
    "relavantDetails",
  ];

  const updatePayload = Object.fromEntries(
    Object.entries(update).filter(
      ([key, value]) =>
        allowedFields.includes(key as keyof QualificationPayload) &&
        value !== undefined,
    ),
  );

  if (Object.keys(updatePayload).length === 0) {
    throw new ApiError(
      400,
      "No valid fields provided for update",
      "BAD_REQUEST",
    );
  }

  const qualification = await Qualification.findOne({
    _id: qualificationId,
    user: userId,
  });

  if (!qualification) {
    throw new ApiError(404, "Qualification not found", "NOT_FOUND");
  }
  qualification.set(updatePayload);
  const updatedProject = await qualification.save();
  return updatedProject;
};
