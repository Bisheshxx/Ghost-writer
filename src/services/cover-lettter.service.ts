import { Types } from "mongoose";
import { geminiModel } from "../config/gemini";
import {
  FINAL_TOUCH_UP,
  FINAL_TOUCH_UP_MONO,
  FIRST_SECTION,
  MIN_FINAL_LENGTH,
  MIN_SECTION_LENGTH,
  PROMPT_RULES,
  SECOND_SECTION,
  THIRD_SECTION,
} from "../constants/prompt";
import {
  buildFinalPrompt,
  buildPrompt,
  buildSourceBlock,
} from "../helpers/cover-lettter.helper";
import { Experience } from "../models/experience.model";
import { Project } from "../models/projects.model";
import { Qualification } from "../models/qualification.model";
import { Skills } from "../models/skills.model";
import { IUserDetails, IUserDetailSource } from "../types/cover-lettter.types";
import { validatePromptText } from "../validation/cover-lettter.validate";
import { resolveUserIdByClerkId } from "./user.service";
import { generateOllamaText } from "../helpers/ollama.helper";

// const generateText = async (prompt: string): Promise<string> => {
//   const response = await geminiModel.generateContent({
//     contents: [{ role: "user", parts: [{ text: prompt }] }],
//   });

//   return response.response.text();
// };

import { generateText as aiGenerateText } from "ai";
import { groqModel } from "../config/groq";

const generateText = async (prompt: string): Promise<string> => {
  const { text } = await aiGenerateText({
    model: groqModel,
    system: `
You are a professional cover letter writer.

${PROMPT_RULES}
    `.trim(),
    prompt,
    temperature: 0.4,
    maxOutputTokens: 900,
  });

  return text.trim();
};
// const generateText = async (prompt: string): Promise<string> => {
//   return generateOllamaText(prompt, {
//     temperature: 0.4,
//     numPredict: 900,
//   });
// };

export const generateCoverLetterService = async (
  clerkId: string,
  jobDescription: string,
) => {
  const userId = await resolveUserIdByClerkId(clerkId);
  const userDetails = await fetchUserDetails(userId);
  const sourceBlock = buildSourceBlock(jobDescription, userDetails);
  const firstPrompt = buildPrompt(FIRST_SECTION, sourceBlock);
  const firstSectionRaw = await generateText(firstPrompt);
  const firstSection = validatePromptText(
    firstSectionRaw,
    "First section",
    MIN_SECTION_LENGTH,
  );

  const secondPrompt = buildPrompt(SECOND_SECTION, sourceBlock);
  const secondSectionRaw = await generateText(secondPrompt);
  const secondSection = validatePromptText(
    secondSectionRaw,
    "Second section",
    MIN_SECTION_LENGTH,
  );

  const thirdPrompt = buildPrompt(THIRD_SECTION, sourceBlock);
  const thirdSectionRaw = await generateText(thirdPrompt);
  const thirdSection = validatePromptText(
    thirdSectionRaw,
    "Third section",
    MIN_SECTION_LENGTH,
  );

  const finalPrompt = buildFinalPrompt(
    firstSection,
    secondSection,
    thirdSection,
  );
  const finalRaw = await generateText(finalPrompt);
  const finalLetter = validatePromptText(
    finalRaw,
    "Final cover letter",
    MIN_FINAL_LENGTH,
  );

  return finalLetter;
};

export const getRefinedCoverLetterMonolithApproach = async (
  userId: string,
  jobDescription: string,
  userSource: IUserDetailSource,
) => {
  const { experienceIds, qualificationIds, skillsId, projectId } = userSource;

  const [experiences, qualifications, skills, projects] = await Promise.all([
    Experience.find({
      _id: { $in: experienceIds },
      user: userId,
    }),

    Qualification.find({
      _id: { $in: qualificationIds },
      user: userId,
    }),

    Skills.findOne({
      _id: skillsId,
      user: userId,
    }),

    Project.find({
      _id: { $in: projectId },
      user: userId,
    }),
  ]);
  const userDetails = { experiences, qualifications, skills, projects };

  const prompt = `
    ROLE: Professional Career Assistant
    TASK: Write a 3-paragraph tailored cover letter.
    
    INPUT DATA:
    - Job Description: ${jobDescription}
    - User Experience: ${userDetails}
    
    CONSTRUCTION STEPS (Follow these internally):
    1. ${FIRST_SECTION}
    2. ${SECOND_SECTION}
    3. ${THIRD_SECTION}
    4. ${FINAL_TOUCH_UP_MONO}
    
    FOLLOW THESE RULES:
    ${PROMPT_RULES}
    
    OUTPUT: Provide only the final polished cover letter.
  `;
};

export const fetchUserDetails = async (
  userId: Types.ObjectId,
): Promise<IUserDetails> => {
  const [experiences, qualifications, skills, projects] = await Promise.all([
    Experience.find({
      user: userId,
    }).lean(),
    Qualification.find({
      user: userId,
    }).lean(),
    Skills.findOne({
      user: userId,
    }).lean(),
    Project.find({
      user: userId,
    }).lean(),
  ]);

  return {
    experiences,
    qualifications,
    skills,
    projects,
  };
};
