import { groq } from "@ai-sdk/groq";

export const GROQ_MODEL_NAME = "llama-3.1-8b-instant";

export const groqModel = groq(GROQ_MODEL_NAME);
