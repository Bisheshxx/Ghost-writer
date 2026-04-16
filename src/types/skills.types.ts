import { Document, Types } from "mongoose";

export interface ITechnicalSkillGroup {
  category: string;
  technologies: string[];
}
export interface IAwards {
  title: string;
  details: string;
  issuedDate: Date;
  Issuer: string;
}

export interface ISkill extends Document {
  user: Types.ObjectId;
  technicalSkills: ITechnicalSkillGroup[];
  personalSkills: string[];
  awards: IAwards[];
  createdAt: Date;
  updatedAt: Date;
}
