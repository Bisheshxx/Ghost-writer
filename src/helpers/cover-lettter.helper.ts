import { FINAL_TOUCH_UP, PROMPT_RULES } from "../constants/prompt";
import { IUserDetails } from "../types/cover-lettter.types";

const serialiseForPrompt = (value: unknown): string => {
  return JSON.stringify(value, null, 2);
};

export const buildSourceBlock = (
  jobDescription: string,
  userDetails: IUserDetails,
): string => {
  return `
<JobDescription>
${jobDescription.trim()}
</JobDescription>

<UserDetails>
${serialiseForPrompt(userDetails)}
</UserDetails>
`.trim();
};

export const buildFinalPrompt = (
  firstSection: string,
  secondSection: string,
  thirdSection: string,
): string => {
  return `
${FINAL_TOUCH_UP}

<Section1>
${firstSection.trim()}
</Section1>

<Section2>
${secondSection.trim()}
</Section2>

<Section3>
${thirdSection.trim()}
</Section3>

${PROMPT_RULES}
`.trim();
};
export const buildPrompt = (
  instruction: string,
  sourceBlock: string,
): string => {
  return `
${instruction}

${sourceBlock}

${PROMPT_RULES}
`.trim();
};
