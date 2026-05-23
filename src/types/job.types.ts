import { Document, Types } from "mongoose";

export const JOB_STATUSES = [
  "Empty",
  "Generated",
  "Applied",
  "Accepted",
  "Rejected",
  "Interview stage",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export interface IJob extends Document {
  user: Types.ObjectId;
  company: string;
  title: string;
  description: string;
  location: string;
  link: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateJobBody = Pick<
  IJob,
  "company" | "title" | "description" | "location" | "link"
> & {
  status?: JobStatus;
};

export type UpdateJobBody = Partial<
  Pick<IJob, "company" | "title" | "description" | "location" | "link" | "status">
>;

export type ListJobsQuery = {
  page: number;
  limit: number;
  search?: string;
  status?: JobStatus;
};

export type JobResponse = {
  id: string;
  company: string;
  title: string;
  description: string;
  location: string;
  link: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginatedJobsResponse = {
  data: JobResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};

export type GeneratedJobContent = {
  jobId: string;
  resumeText: string;
  coverLetterText: string;
  model: string;
  createdAt: string;
};
