import mongoose, { Schema } from "mongoose";
import { IQualification } from "../types/qualification.types";
import {
  monthYearValidator,
  nullableMonthYearValidator,
} from "../utils/schema.validator";

const QualificationSchema = new Schema<IQualification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    universityName: {
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
      validate: monthYearValidator,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    endDate: {
      type: String,
      default: null,
      validate: nullableMonthYearValidator,
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

export const Qualification = mongoose.model<IQualification>(
  "Qualification",
  QualificationSchema,
);
