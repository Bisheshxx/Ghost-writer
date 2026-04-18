import { Document, Types } from "mongoose";

export interface ITechnicalSkillGroup {
  category: string;
  technologies: string[];
}
export interface IAwards {
  title: string;
  details: string;
  issuedDate: Date;
  issuer: string;
}

export interface ISkill extends Document {
  user: Types.ObjectId;
  technicalSkills: ITechnicalSkillGroup[];
  personalSkills: string[];
  awards?: IAwards[];
  createdAt: Date;
  updatedAt: Date;
}

export type SkillsInput = Pick<
  ISkill,
  "technicalSkills" | "personalSkills" | "awards"
>;

export const SkillName = {
  TechnicalSkills: "technicalSkills",
  PersonalSkills: "personalSkills",
  Awards: "awards",
} as const;

export type SkillName = (typeof SkillName)[keyof typeof SkillName];
