import z from "zod";
import { requiredString } from "../helpers/validation.helper";

export const validatePromptText = (
  value: string | undefined | null,
  label: string,
  minLength: number,
): string => {
  const cleaned = value?.trim();

  if (!cleaned || cleaned.length < minLength) {
    throw new Error(`${label} response incomplete`);
  }

  return cleaned;
};

export const CoverLetterSchema = z.object({
  jobDescription: requiredString("Job Description"),
});
