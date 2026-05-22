// src/helpers/ollama.helper.ts

import { OLLAMA_BASE_URL, OLLAMA_MODEL } from "../config/ollama";

type OllamaMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OllamaChatResponse = {
  model: string;
  message?: {
    role: string;
    content: string;
  };
  done: boolean;
};

export const generateOllamaText = async (
  prompt: string,
  options?: {
    temperature?: number;
    numPredict?: number;
  },
): Promise<string> => {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "You are an expert career writing assistant. Write concise, natural, tailored cover letters using New Zealand English. Do not use em dashes. Avoid generic AI-sounding phrasing.",
        },
        {
          role: "user",
          content: prompt,
        },
      ] satisfies OllamaMessage[],
      options: {
        temperature: options?.temperature ?? 0.4,
        num_predict: options?.numPredict ?? 900,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Ollama request failed with status ${response.status}: ${errorText}`,
    );
  }

  const data = (await response.json()) as OllamaChatResponse;

  const text = data.message?.content?.trim();

  if (!text) {
    throw new Error("Ollama returned an empty response");
  }

  return text;
};
