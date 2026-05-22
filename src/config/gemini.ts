import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel(
  // {
  //   model: "gemini-2.5-flash", // Use the full Flash, not Lite
  // },
  // {
  //   apiVersion: "v1", // Use stable v1 for the 2.5 series
  // },
  {
    model: "gemini-3.1-flash-live-preview", // The latest real-time optimized model
  },
  {
    apiVersion: "v1", // Use v1 for stable features or "v1beta" for newest preview features
  },
);
