import { Project } from "../models/projects.model";
import { CreateProjectBody } from "../types/project.types";
import { ApiError } from "../utils/apiError";
import { resolveUserIdByClerkId } from "./user.service";

export const createProjectService = async (
  clerkId: string,
  projects: CreateProjectBody[],
) => {
  if (!Array.isArray(projects) || projects.length === 0) {
    throw new ApiError(400, "At least one project is required", "BAD_REQUEST");
  }
  const userId = await resolveUserIdByClerkId(clerkId);
  const docsToInsert = projects.map((project) => ({
    ...project,
    user: userId,
  }));
  const createdProjects = await Project.insertMany(docsToInsert);
  return createdProjects;
};

export const getProjectService = async (clerkId: string) => {
  const userId = await resolveUserIdByClerkId(clerkId);
  const project = await Project.find({ user: userId });
  return project;
};

export const deleteProjectService = async (
  clerkId: string,
  projectId: string,
) => {
  const userId = await resolveUserIdByClerkId(clerkId);
  const project = await Project.findOne({
    _id: projectId,
    user: userId,
  });
  if (!project) {
    throw new ApiError(404, "Project not found", "NOT_FOUND");
  }
  await project.deleteOne();
  return null;
};

export const updateProjectService = async (
  clerkId: string,
  projectId: string,
  update: Partial<CreateProjectBody>,
) => {
  const userId = await resolveUserIdByClerkId(clerkId);
  const allowedFields: Array<keyof CreateProjectBody> = [
    "details",
    "projectTitle",
    "stack",
  ];

  const updatePayload = Object.fromEntries(
    Object.entries(update).filter(
      ([key, value]) =>
        allowedFields.includes(key as keyof CreateProjectBody) &&
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

  const project = await Project.findOne({
    _id: projectId,
    user: userId,
  });

  if (!project) {
    throw new ApiError(404, "Project not found", "NOT_FOUND");
  }
  project.set(updatePayload);
  const updatedProject = await project.save();
  return updatedProject;
};
