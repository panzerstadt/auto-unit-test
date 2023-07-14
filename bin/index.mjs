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
import chokidar from "chokidar";
import { existsSync } from "fs";
import fs from "node:fs/promises";
import { IGNORED, getCoverageFilePath, getDocFilePath, getPromptHistoryFilePath, getTestFilePath, } from "./constants.mjs";
import { generateDocs } from "./documentation/generate.mjs";
import { generateAdditionalTests, generateTests } from "./testing/generate.mjs";
import { runTests } from "./testing/run.mjs";
import { hasEnoughTestCoverage } from "./testing/utils.mjs";
import { loadPromptHistory, savePromptHistory } from "./utils.mjs";
const GENERATE_DOCS = !!process.env.GENERATE_DOCUMENTATION;
function generateTestsOnSave(filePath, extension = "js") {
    return __awaiter(this, void 0, void 0, function* () {
        const testFilePath = getTestFilePath(filePath, extension);
        const promptHistoryFilePath = getPromptHistoryFilePath(filePath, extension);
        if (existsSync(testFilePath)) {
            console.log(`Tests exist for ${filePath}, skipping. If you want to regenerate tests, delete the current one and save the file again.`);
            return;
        }
        try {
            const input = yield fs.readFile(filePath, "utf8");
            const { tests, history } = yield generateTests(filePath, input, extension);
            yield fs.writeFile(testFilePath, tests);
            yield savePromptHistory(promptHistoryFilePath, history);
            console.log(`Generated tests for ${filePath}`);
        }
        catch (error) {
            console.error(`Error generating tests for ${filePath}`, error);
        }
    });
}
function addMoreTests(filePath, extension, promptHistory) {
    return __awaiter(this, void 0, void 0, function* () {
        const testFilePath = getTestFilePath(filePath, extension);
        if (!existsSync(testFilePath)) {
            console.log(`tests not found at: ${testFilePath}.`);
            throw new Error("tests not found");
        }
        if (!testFilePath.includes(".test.")) {
            console.warn(`this does not seem to be a test file. please make sure your test files are named *.test.js`);
            return;
        }
        console.log("generating more tests...");
        const { tests, history } = yield generateAdditionalTests(promptHistory);
        yield fs.appendFile(testFilePath, tests);
        yield savePromptHistory(getPromptHistoryFilePath(filePath, "js"), history);
    });
}
export function generateDocsOnSave(filePath, extension = "js") {
    return __awaiter(this, void 0, void 0, function* () {
        const docFilePath = getDocFilePath(filePath, extension);
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
console.log(`auto-unit-test started. save any .js|ts|mjs|mts|jsx|tsx file and watch it generate tests${GENERATE_DOCS ? " and docs" : ""}!`);
// watch for changes to js files, skipping over test files
// filetypes: js, ts, mjs, mts, jsx, tsx
chokidar
    .watch("**/*.{js,ts,mjs,mts,jsx,tsx}", {
    atomic: true,
    awaitWriteFinish: true,
    ignored: IGNORED,
})
    .on("change", (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const extension = filePath.split(".")[1];
    // if the file being saved is a test file, run tests
    if (filePath.includes(".test.")) {
        const cleaned = filePath.replace(".test.", ".");
        console.log(`running tests for ${cleaned}`);
        yield runTests(cleaned);
        return;
    }
    if (GENERATE_DOCS) {
        // generate docs, tests and run tests on code
        console.log(`trying to generate docs for: ${filePath}...`);
        generateDocsOnSave(filePath, extension);
    }
    console.log(`trying to generate tests for: ${filePath}...`);
    yield generateTestsOnSave(filePath, extension);
    console.log(`running tests for ${filePath}`);
    const pass = yield runTests(filePath);
    if (!pass)
        return;
    const coverageFile = getCoverageFilePath(filePath, extension);
    if (existsSync(coverageFile)) {
        const highEnough = yield hasEnoughTestCoverage(coverageFile);
        if (!highEnough) {
            console.warn("Coverage is not high enough, adding more tests.");
            try {
                const promptHistory = yield loadPromptHistory(filePath);
                yield addMoreTests(filePath, extension, promptHistory);
            }
            catch (e) {
                console.error("Error adding tests", e);
            }
        }
    }
}));
