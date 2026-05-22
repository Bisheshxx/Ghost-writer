import mongoose, { Schema } from "mongoose";
import { IJob, JOB_STATUSES } from "../types/job.types";

const JobSchema = new Schema<IJob>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: JOB_STATUSES,
      default: "Empty",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

JobSchema.index({ user: 1, status: 1, createdAt: -1 });

export const Job = mongoose.model<IJob>("Job", JobSchema);
