#! /usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import { Configuration, OpenAIApi } from "openai";
import chokidar from "chokidar";
import { existsSync } from "fs";
import fs from "node:fs/promises";
import jest from "jest";
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
function generateTests(filePath, input) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `// Javascript
  // write unit tests for the following function that will work for
  // the jest testing framework.
  // Assume that the function is exported as a default export, and name the function testFunction
  // Assume that the reply is a valid javascript file
  // the tests have to achieve 100% test coverage
  // the tests should additionally cover edge cases, and should be as comprehensive as possible

  ${input}
  
  // in your reply, start with the following:
  const testFunction = require("./${filePath}');
  `;
        const completions = yield openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
        });
        const generatedTests = completions.data.choices[0].message.content || "";
        return generatedTests;
    });
}
function runTests(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const testFilePath = filePath.replace(".js", ".test.js");
        const options = {
            projects: [process.cwd()],
            silent: true,
            coverage: true,
            testRegex: testFilePath,
        };
        // @ts-ignore
        const { results } = yield jest.runCLI(options, options.projects);
        // console.log("converage?", results.testResults); // TODO: jest doens't expose coverage data
        // console.log("results", results.testResults[0].testResults);
        const resultJSON = results.testResults[0].testResults;
        console.log("\nresults:\n-----------");
        resultJSON.forEach((res) => {
            const passed = res.status === "passed";
            console.log(`${passed ? "✓" : "✘"} ${res.status}: ${res.fullName}`);
        });
        const hasFailures = resultJSON.some((res) => res.status !== "passed");
        if (hasFailures) {
            console.warn("\nOne or more tests failed, please fix them before continuing.");
        }
    });
}
function generateTestsOnSave(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const testFilePath = filePath.replace(".js", ".test.js");
        if (existsSync(testFilePath)) {
            console.log(`Tests exist for ${filePath}, skipping. If you want to regenerate tests, delete the current one and save the file again.`);
            return;
        }
        try {
            const input = yield fs.readFile(filePath, "utf8");
            const generatedTests = yield generateTests(filePath, input);
            yield fs.writeFile(testFilePath, generatedTests);
            console.log(`Generated tests for ${filePath}`);
        }
        catch (error) {
            console.error(`Error generating tests for ${filePath}`, error);
        }
    });
}
function generateDocs(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `Generate professional documentation, and include example usage patterns for the following code: "${input}"`;
        const completions = yield openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });
        const generatedTests = completions.data.choices[0].message.content || "";
        return generatedTests;
    });
}
function generateDocsOnSave(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const docFilePath = filePath.replace(".js", ".md");
        if (existsSync(docFilePath)) {
            console.log(`Documentation exists for ${filePath}, skipping. If you want to regenerate docs, delete the current one and save the file again.`);
            return;
        }
        try {
            const input = yield fs.readFile(filePath, "utf8");
            const generatedTests = yield generateDocs(input);
            yield fs.writeFile(docFilePath, generatedTests);
            console.log(`Generated documentation for ${filePath}`);
        }
        catch (error) {
            console.error(`Error generating docs for ${filePath}`, error);
        }
    });
}
console.log("auto-unit-test started. save any .js file and watch it generate tests and docs!");
// watch for changes to js files, skipping over test files
chokidar.watch("**/*.js").on("change", (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    if (filePath.includes("coverage"))
        return;
    // if the file being saved is a test file, run tests
    if (filePath.includes(".test.")) {
        const cleaned = filePath.replace(".test.", ".");
        console.log(`running tests for ${cleaned}`);
        yield runTests(cleaned);
    }
    // generate docs, tests and run tests on code
    if (!filePath.includes(".test.")) {
        console.log(`trying to generate docs for: ${filePath}...`);
        generateDocsOnSave(filePath);
        console.log(`trying to generate tests for: ${filePath}...`);
        yield generateTestsOnSave(filePath);
        console.log(`running tests for ${filePath}`);
        yield runTests(filePath);
    }
}));
