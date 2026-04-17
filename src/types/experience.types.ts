import { Document, Types } from "mongoose";

export interface IExperience extends Document {
  user: Types.ObjectId;
  jobTitle: string;
  Descriptions: string;
  startDate: string;
  isCurrent: boolean;
  endDate?: string | null;
  createdAt: Date;
  updatedAt: Date;
  companyName: string;
  relavantDetails?: string | null;
}
