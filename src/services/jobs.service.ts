import { Job } from "../models/job.model";
import {
  CreateJobBody,
  GeneratedJobArtifact,
  IJob,
  JobResponse,
  ListJobsQuery,
  PaginatedJobsResponse,
  UpdateJobBody,
} from "../types/job.types";
import { ApiError } from "../utils/apiError";
import { resolveUserIdByClerkId } from "./user.service";

const allowedUpdateFields: Array<keyof UpdateJobBody> = [
  "company",
  "title",
  "description",
  "location",
  "link",
  "status",
];

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toJobResponse = (job: IJob): JobResponse => ({
  id: job._id.toString(),
  company: job.company,
  title: job.title,
  description: job.description,
  location: job.location,
  link: job.link,
  status: job.status,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
});

const buildOwnerFilter = async (clerkId: string, jobId?: string) => {
  const userId = await resolveUserIdByClerkId(clerkId);
  return {
    ...(jobId ? { _id: jobId } : {}),
    user: userId,
  };
};

export const createJobService = async (
  clerkId: string,
  payload: CreateJobBody,
): Promise<JobResponse> => {
  const userId = await resolveUserIdByClerkId(clerkId);
  const job = await Job.create({
    ...payload,
    status: payload.status ?? "Empty",
    user: userId,
  });

  return toJobResponse(job);
};

export const listJobsService = async (
  clerkId: string,
  query: ListJobsQuery,
): Promise<PaginatedJobsResponse> => {
  const userId = await resolveUserIdByClerkId(clerkId);
  const filter: Record<string, unknown> = { user: userId };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const searchRegex = new RegExp(escapeRegExp(query.search), "i");
    filter.$or = [
      { company: searchRegex },
      { title: searchRegex },
      { description: searchRegex },
      { location: searchRegex },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    Job.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / query.limit);

  return {
    data: jobs.map(toJobResponse),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNextPage: query.page < totalPages,
    },
  };
};

export const getJobService = async (
  clerkId: string,
  jobId: string,
): Promise<JobResponse> => {
  const filter = await buildOwnerFilter(clerkId, jobId);
  const job = await Job.findOne(filter);

  if (!job) {
    throw new ApiError(404, "Job not found", "NOT_FOUND");
  }

  return toJobResponse(job);
};

export const updateJobService = async (
  clerkId: string,
  jobId: string,
  update: UpdateJobBody,
): Promise<JobResponse> => {
  const updatePayload = Object.fromEntries(
    Object.entries(update).filter(
      ([key, value]) =>
        allowedUpdateFields.includes(key as keyof UpdateJobBody) &&
        value !== undefined,
    ),
  ) as UpdateJobBody;

  if (Object.keys(updatePayload).length === 0) {
    throw new ApiError(
      400,
      "No valid fields provided for update",
      "BAD_REQUEST",
    );
  }

  const filter = await buildOwnerFilter(clerkId, jobId);
  const job = await Job.findOne(filter);

  if (!job) {
    throw new ApiError(404, "Job not found", "NOT_FOUND");
  }

  job.set(updatePayload);
  const updatedJob = await job.save();
  return toJobResponse(updatedJob);
};

export const updateJobStatusService = async (
  clerkId: string,
  jobId: string,
  status: UpdateJobBody["status"],
): Promise<JobResponse> => {
  if (!status) {
    throw new ApiError(400, "Status is required", "BAD_REQUEST");
  }

  return updateJobService(clerkId, jobId, { status });
};

export const deleteJobService = async (
  clerkId: string,
  jobId: string,
): Promise<null> => {
  const filter = await buildOwnerFilter(clerkId, jobId);
  const job = await Job.findOne(filter);

  if (!job) {
    throw new ApiError(404, "Job not found", "NOT_FOUND");
  }

  await job.deleteOne();
  return null;
};

export const generateJobArtifactService = async (
  clerkId: string,
  jobId: string,
  type: GeneratedJobArtifact["type"],
): Promise<GeneratedJobArtifact> => {
  const job = await getJobService(clerkId, jobId);
  const artifactName = type === "resume" ? "Resume" : "Cover letter";

  return {
    jobId: job.id,
    type,
    content: `${artifactName} draft for ${job.title} at ${job.company}. This deterministic placeholder uses the saved job description and can be replaced by AI generation later.`,
    createdAt: new Date().toISOString(),
  };
};
