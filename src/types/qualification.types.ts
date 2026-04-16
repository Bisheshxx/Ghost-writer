import { Document, Types } from "mongoose";

export interface IQualification extends Document {
  user: Types.ObjectId;
  qualification: string;
  Descriptions: string;
  startDate: string;
  isCurrent: boolean;
  endDate?: string | null;
  createdAt: Date;
  updatedAt: Date;
  universityName: string;
  relavantDetails: string;
}
