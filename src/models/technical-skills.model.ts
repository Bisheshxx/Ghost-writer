import mongoose, { Schema } from "mongoose";
import { ITechnicalSkill } from "../types/technical-skills.types";

const SkillGroupSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    technologies: {
      type: [String],
      required: true,
      default: [],
    },
  },
  { _id: false },
);

const TechnicalSkillSchema = new Schema<ITechnicalSkill>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    technicalSkills: {
      type: [SkillGroupSchema],
      default: [],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const TechnicalSkill = mongoose.model<ITechnicalSkill>(
  "TechnicalSkill",
  TechnicalSkillSchema,
);
