import { Document, Types } from "mongoose";

export interface IQualification extends Document {
  user: Types.ObjectId;
  qualification: string;
  descriptions: string;
  startDate: string;
  isCurrent: boolean;
  endDate?: string | null;
  createdAt: Date;
  updatedAt: Date;
  instituteName: string;
  relavantDetails: string;
}

export type QualificationPayload = Pick<
  IQualification,
  | "qualification"
  | "descriptions"
  | "startDate"
  | "isCurrent"
  | "endDate"
  | "instituteName"
  | "relavantDetails"
>;
