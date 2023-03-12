#! /usr/bin/env node

import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import { ChatCompletionRequestMessage } from "openai";
import chokidar from "chokidar";
import { existsSync } from "fs";
import fs from "node:fs/promises";

import {
  IGNORED,
  getCoverageFilePath,
  getDocFilePath,
  getPromptHistoryFilePath,
  getTestFilePath,
} from "./constants.mjs";
import { generateDocs } from "./documentation/generate.mjs";
import { generateAdditionalTests, generateTests } from "./testing/generate.mjs";
import { runTests } from "./testing/run.mjs";
import { hasEnoughTestCoverage } from "./testing/utils.mjs";
import { loadPromptHistory, savePromptHistory } from "./utils.mjs";

async function generateTestsOnSave(filePath: string, extension = "js") {
  const testFilePath = getTestFilePath(filePath, extension);
  const promptHistoryFilePath = getPromptHistoryFilePath(filePath, extension);

  if (existsSync(testFilePath)) {
    console.log(
      `Tests exist for ${filePath}, skipping. If you want to regenerate tests, delete the current one and save the file again.`
    );
    return;
  }
  try {
    const input = await fs.readFile(filePath, "utf8");
    const { tests, history } = await generateTests(filePath, input, extension);
    await fs.writeFile(testFilePath, tests);
    await savePromptHistory(promptHistoryFilePath, history);
    console.log(`Generated tests for ${filePath}`);
  } catch (error) {
    console.error(`Error generating tests for ${filePath}`, error);
  }
}

async function addMoreTests(
  filePath: string,
  extension: string,
  promptHistory: ChatCompletionRequestMessage[]
) {
  const testFilePath = getTestFilePath(filePath, extension);
  if (!existsSync(testFilePath)) {
    console.log(`tests not found at: ${testFilePath}.`);
    throw new Error("tests not found");
  }
  if (!testFilePath.includes(".test.")) {
    console.warn(
      `this does not seem to be a test file. please make sure your test files are named *.test.js`
    );
    return;
  }

  console.log("generating more tests...");
  const { tests, history } = await generateAdditionalTests(promptHistory);
  await fs.appendFile(testFilePath, tests);
  await savePromptHistory(getPromptHistoryFilePath(filePath, "js"), history);
}

export async function generateDocsOnSave(filePath: string, extension = "js") {
  const docFilePath = getDocFilePath(filePath, extension);

  if (existsSync(docFilePath)) {
    console.log(
      `Documentation exists for ${filePath}, skipping. If you want to regenerate docs, delete the current one and save the file again.`
    );
    return;
  }

  try {
    const input = await fs.readFile(filePath, "utf8");
    const generatedTests = await generateDocs(input);
    await fs.writeFile(docFilePath, generatedTests);
    console.log(`Generated documentation for ${filePath}`);
  } catch (error) {
    console.error(`Error generating docs for ${filePath}`, error);
  }
}

console.log("auto-unit-test started. save any .js file and watch it generate tests and docs!");
// watch for changes to js files, skipping over test files
// filetypes: js, ts, mjs, mts, jsx, tsx
chokidar
  .watch("**/*.js", { atomic: true, awaitWriteFinish: true, ignored: IGNORED })
  .on("change", async (filePath) => {
    // if the file being saved is a test file, run tests
    if (filePath.includes(".test.")) {
      const cleaned = filePath.replace(".test.", ".");
      console.log(`running tests for ${cleaned}`);
      await runTests(cleaned);
      return;
    }

    // generate docs, tests and run tests on code
    console.log(`trying to generate docs for: ${filePath}...`);
    generateDocsOnSave(filePath, "js");

    console.log(`trying to generate tests for: ${filePath}...`);
    await generateTestsOnSave(filePath, "js");

    console.log(`running tests for ${filePath}`);
    const pass = await runTests(filePath);

    if (!pass) return;

    const coverageFile = getCoverageFilePath(filePath, "js");
    if (existsSync(coverageFile)) {
      const highEnough = await hasEnoughTestCoverage(coverageFile);
      if (!highEnough) {
        console.warn("Coverage is not high enough, adding more tests.");

        try {
          const promptHistory = await loadPromptHistory(filePath);
          await addMoreTests(filePath, "js", promptHistory);
        } catch (e) {
          console.error("Error adding tests", e);
        }
      }
    }
  });
