import { Job } from "../models/job.model";
import {
  CreateJobBody,
  GeneratedJobContent,
  IJob,
  JobResponse,
  ListJobsQuery,
  PaginatedJobsResponse,
  UpdateJobBody,
} from "../types/job.types";
import { PROMPT_RULES } from "../constants/prompt";
import { generateCareerText, CAREER_TEXT_MODEL } from "../helpers/ai-text.helper";
import { buildSourceBlock } from "../helpers/cover-lettter.helper";
import { ApiError } from "../utils/apiError";
import { fetchUserDetails } from "./cover-lettter.service";
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
  const sortDirection = query.sortOrder === "asc" ? 1 : -1;
  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: sortDirection })
      .skip(skip)
      .limit(query.limit),
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

const buildResumePrompt = (sourceBlock: string) => `
Write a tailored resume draft for this job using the candidate details provided.
Prioritize directly relevant experience, projects, skills, and qualifications.
Use clear resume section headings and concise bullet points.
Do not include commentary, markdown fences, or placeholders.

${sourceBlock}

${PROMPT_RULES}
`.trim();

const buildCoverLetterPrompt = (sourceBlock: string) => `
Write a polished, tailored cover letter for this job using the candidate details provided.
Make the letter specific to the role and company where possible.
Do not include commentary, markdown fences, or placeholders.

${sourceBlock}

${PROMPT_RULES}
`.trim();

export const generateJobContentService = async (
  clerkId: string,
  jobId: string,
): Promise<GeneratedJobContent> => {
  const job = await getJobService(clerkId, jobId);
  const userId = await resolveUserIdByClerkId(clerkId);
  const userDetails = await fetchUserDetails(userId);
  const sourceBlock = buildSourceBlock(job.description, userDetails);
  const [resumeText, coverLetterText] = await Promise.all([
    generateCareerText({
      system: "You are a professional resume writer.",
      prompt: buildResumePrompt(sourceBlock),
    }),
    generateCareerText({
      system: "You are a professional cover letter writer.",
      prompt: buildCoverLetterPrompt(sourceBlock),
    }),
  ]);

  return {
    jobId: job.id,
    resumeText,
    coverLetterText,
    model: CAREER_TEXT_MODEL,
    createdAt: new Date().toISOString(),
  };
};
