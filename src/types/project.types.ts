import { Document, Types } from "mongoose";

export interface IProject extends Document {
  user: Types.ObjectId;
  projectTitle: string;
  // startDate?: string;
  // endDate?: string;
  stack: string[];
  details: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProjectBody = Pick<
  IProject,
  "projectTitle" | "details" | "stack"
>;
