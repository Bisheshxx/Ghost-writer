import mongoose, { Schema } from "mongoose";
import { ISkill } from "../types/skills.types";

const TechnicalSkillGroupSchema = new Schema(
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

const AwardGroupSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  details: {
    type: String,
    required: true,
    trim: true,
  },
  issuer: {
    type: String,
    required: true,
    trim: true,
  },
  issuedDate: {
    type: Date,
    required: true,
  },
});

const SkillsSchema = new Schema<ISkill>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    technicalSkills: {
      type: [TechnicalSkillGroupSchema],
      default: [],
    },
    personalSkills: {
      type: [String],
      default: [],
    },
    awards: {
      type: [AwardGroupSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const Skills = mongoose.model<ISkill>("Skills", SkillsSchema);
