import { generateText as aiGenerateText } from "ai";
import { GROQ_MODEL_NAME, groqModel } from "../config/groq";

type GenerateCareerTextOptions = {
  system: string;
  prompt: string;
};

export const generateCareerText = async ({
  system,
  prompt,
}: GenerateCareerTextOptions): Promise<string> => {
  const { text } = await aiGenerateText({
    model: groqModel,
    system,
    prompt,
    temperature: 0.4,
    maxOutputTokens: 900,
  });

  return text.trim();
};

export const CAREER_TEXT_MODEL = GROQ_MODEL_NAME;
