import mongoose, { Schema } from "mongoose";
import { IExperience } from "../types/experience.types";

const MONTH_YEAR_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const ExperienceSchema = new Schema<IExperience>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    Descriptions: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => MONTH_YEAR_REGEX.test(value),
        message: "startDate must be in YYYY-MM format",
      },
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    endDate: {
      type: String,
      default: null,
      validate: {
        validator: (value: string | null) =>
          value === null || MONTH_YEAR_REGEX.test(value),
        message: "endDate must be null or in YYYY-MM format",
      },
    },
    relavantDetails: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
//mickey typeshi
ExperienceSchema.pre("validate", function () {
  if (this.isCurrent) {
    this.endDate = null;
    return;
  }

  if (this.endDate) {
    const start = new Date(`${this.startDate}-01T00:00:00.000Z`);
    const end = new Date(`${this.endDate}-01T00:00:00.000Z`);

    if (end < start) {
      throw new Error("endDate cannot be earlier than startDate");
    }
  }
});

export const Experience = mongoose.model<IExperience>(
  "Experience",
  ExperienceSchema,
);
