import mongoose, { Schema } from "mongoose";
import { IProject } from "../types/project.types";
import {
  monthYearValidator,
  nullableMonthYearValidator,
} from "../utils/schema.validator";

const ProjectSchema = new Schema<IProject>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    projectTitle: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: String,
      default: null,
      validate: monthYearValidator,
    },
    endDate: {
      type: String,
      default: null,
      validate: nullableMonthYearValidator,
    },
  },
  {
    timestamps: true,
  },
);

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
