import { ChatCompletionRequestMessage } from "openai";
import fs from "node:fs/promises";
import { getPromptHistoryFilePath } from "./constants.mjs";

export const savePromptHistory = async (
  filePath: string,
  messages: ChatCompletionRequestMessage[]
) => await fs.writeFile(filePath, JSON.stringify(messages, null, 2));

export const loadPromptHistory = async (filePath: string) => {
  const promptHistoryString = await fs.readFile(getPromptHistoryFilePath(filePath, "js"), "utf8");
  return JSON.parse(promptHistoryString) as ChatCompletionRequestMessage[];
};

export const getLang = (extension) => {
  switch (extension) {
    case "js":
      return "javascript";
    case "ts":
      return "typescript";
    case "mjs":
      return "javascript";
    case "mts":
      return "typescript";
    case "jsx":
      return "javascript react";
    case "tsx":
      return "typescript react";
    default:
      return "javascript";
  }
};
