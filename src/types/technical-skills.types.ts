import { Document, Types } from "mongoose";

export interface SkillGroup {
  category: string;
  technologies: string[];
}

export interface ITechnicalSkill extends Document {
  user: Types.ObjectId;
  technicalSkills: SkillGroup[];
  createdAt: Date;
  updatedAt: Date;
}
