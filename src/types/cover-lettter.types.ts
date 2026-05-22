import { Types } from "mongoose";
import { IExperience } from "./experience.types";
import { IQualification } from "./qualification.types";
import { ISkill } from "./skills.types";
import { IProject } from "./project.types";

export interface IUserDetailSource {
  experienceIds: string[];
  qualificationIds: string[];
  skillsId: string;
  projectId: string[];
}

export interface ICoverLetterPayload {
  jobDescription: string;
  userSource: IUserDetailSource;
}

export interface IUserDetails {
  experiences: Array<
    IExperience & Required<{ _id: Types.ObjectId }> & { __v: number }
  >;
  qualifications: Array<
    IQualification & Required<{ _id: Types.ObjectId }> & { __v: number }
  >;
  skills: (ISkill & Required<{ _id: Types.ObjectId }> & { __v: number }) | null;
  projects: Array<
    IProject & Required<{ _id: Types.ObjectId }> & { __v: number }
  >;
}
