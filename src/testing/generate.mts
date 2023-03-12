import { ChatCompletionRequestMessage } from "openai";
import path from "path";
import { ask, continueConversation, openai } from "../api/index.mjs";
import fs from "node:fs/promises";
import { getLang } from "../utils.mjs";

export async function generateTests(filePath: string, input: string, extension = "js") {
  const baseName = path.basename(filePath);

  const prompt = `// ${getLang(extension)}
    // write unit tests for the following function that will work for
    // the jest testing framework.
    // Assume that the function is exported as a default export, and name the function testFunction
    // Assume that the reply is a valid ${getLang(extension)} file
    // the tests have to achieve 100% test coverage
    // the tests should additionally cover edge cases, and should be as comprehensive as possible
    // if you ever need to add any comments, please prefix them with '//' to ensure your response is still valid ${getLang(
      extension
    )} code
  
    ${input}
    
    // in your reply, start with the following:
    const testFunction = require("./${baseName}');
    `;

  console.log("prompt sent", prompt);

  const { reply, history } = await ask(prompt);
  return { tests: reply, history };
}

export async function generateAdditionalTests(promptHistory: ChatCompletionRequestMessage[]) {
  const prompt = `the given tests are not 100% coverage yet. please add more tests. you don't have to repeat yourself, as i will append your reply to the previous code. please also continue to only reply in valid code, if you feel the need to add any comments, please also prefix them with '//' to ensure your response is valid code`;

  const { reply, history } = await continueConversation(prompt, promptHistory);
  return { tests: reply, history };
}
